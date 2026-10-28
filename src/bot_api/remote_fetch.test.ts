import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import http from 'node:http';
import { PassThrough } from 'node:stream';
import { it } from 'node:test';
import { createApiClient } from './client.ts';
import { InputFile } from './input_file.ts';
import { type RemoteFetchOptions, remoteFetch } from './remote_fetch.ts';

const lookup =
	(...addresses: string[]): NonNullable<RemoteFetchOptions['lookup']> =>
	(_host, _options, callback) =>
		callback(
			null,
			addresses.map((address) => ({ address, family: address.includes(':') ? 6 : 4 })),
		);

it('rejects schemes before DNS or requests', async () => {
	for (const scheme of [
		'file:///etc/passwd',
		'data:text/plain,hi',
		'ftp://example.com',
		'javascript:alert(1)',
	]) {
		await assert.rejects(
			remoteFetch(scheme, { lookup: () => assert.fail('DNS used') }),
			/only http/,
		);
	}
});

it('blocks every private range via DNS and literals, including normalized IP forms', async () => {
	const addresses = [
		'0.1.2.3',
		'10.0.0.1',
		'100.64.0.1',
		'100.127.255.255',
		'127.0.0.1',
		'169.254.169.254',
		'172.16.0.1',
		'172.31.255.255',
		'192.168.1.1',
		'192.0.0.8',
		'198.18.0.1',
		'198.19.1.1',
		'224.0.0.1',
		'240.0.0.1',
		'255.255.255.255',
		'::',
		'::1',
		'fc00::1',
		'fdff::1',
		'fe80::1',
		'febf::1',
		'ff02::1',
		'::ffff:127.0.0.1',
		'::ffff:7f00:1',
		'::127.0.0.1',
		'::a00:1',
		'64:ff9b::7f00:1',
		'64:ff9b::a9fe:a9fe',
		'2002:7f00:1::1',
		'2002:c0a8:101::1',
	];
	for (const address of addresses) {
		await assert.rejects(
			remoteFetch('http://public.test', { lookup: lookup('8.8.8.8', address) }),
			/private or local/,
		);
		await assert.rejects(
			remoteFetch(`http://${address.includes(':') ? `[${address}]` : address}`),
			/private or local/,
		);
	}
	for (const host of ['2130706433', '0177.0.0.1', '0x7f000001'])
		await assert.rejects(remoteFetch(`http://${host}`), /private or local/);
});

// Use Node request mocks to exercise public addresses and stream limits without external traffic.
it('pins public DNS answers and handles redirects, size limits, status and deadlines', async (t) => {
	let status = 200;
	let headers: Record<string, string> = {};
	let body = ['hello'];
	let pending = false;
	let calls = 0;
	let lastResponse: PassThrough | undefined;
	t.mock.method(
		http,
		'request',
		(
			_url: URL,
			options: http.RequestOptions,
			callback: (response: http.IncomingMessage) => void,
		) => {
			calls++;
			assert.equal(_url.hostname, 'public.test');
			const pinned = options.lookup;
			assert.ok(pinned);
			pinned('public.test', {}, (error, address) => {
				assert.equal(error, null);
				assert.equal(address, '8.8.8.8');
			});
			pinned('public.test', { all: true }, (error, addresses) => {
				assert.equal(error, null);
				assert.deepEqual(addresses, [{ address: '8.8.8.8', family: 4 }]);
			});
			const request = new EventEmitter() as EventEmitter & { end(): void };
			request.end = () => {
				if (pending) return;
				const stream = Object.assign(new PassThrough(), { statusCode: status, headers });
				lastResponse = stream;
				callback(stream as unknown as http.IncomingMessage);
				for (const chunk of body) stream.write(chunk);
				stream.end();
			};
			options.signal?.addEventListener('abort', () => request.emit('error', new Error('aborted')), {
				once: true,
			});
			return request;
		},
	);
	const options = { lookup: lookup('8.8.8.8') };
	assert.equal(await (await remoteFetch('http://public.test', options)).text(), 'hello');
	status = 302;
	headers = { location: 'http://127.0.0.1/secret' };
	await assert.rejects(remoteFetch('http://public.test', options), /private or local/);
	// A redirect to a name that only resolves privately is re-resolved and blocked before connecting.
	headers = { location: 'http://internal.test/admin' };
	calls = 0;
	const split: RemoteFetchOptions['lookup'] = (hostname, _options, callback) =>
		callback(null, [{ address: hostname === 'internal.test' ? '10.0.0.5' : '8.8.8.8', family: 4 }]);
	await assert.rejects(
		remoteFetch('http://public.test', { lookup: split }),
		/private or local address \(10\.0\.0\.5\)/,
	);
	assert.equal(calls, 1);
	headers = { location: '/next' };
	calls = 0;
	await assert.rejects(remoteFetch('http://public.test', options), /redirect limit/);
	assert.equal(calls, 6);
	headers = { location: 'file:///secret' };
	await assert.rejects(remoteFetch('http://public.test', options), /only http/);
	status = 404;
	headers = {};
	await assert.rejects(remoteFetch('http://public.test', options), /HTTP 404/);
	status = 200;
	headers = { 'content-length': '100' };
	await assert.rejects(
		remoteFetch('http://public.test', { ...options, maxBytes: 4 }),
		/size limit/,
	);
	assert.ok(lastResponse?.destroyed);
	headers = {};
	body = ['abc', 'def'];
	await assert.rejects(
		remoteFetch('http://public.test', { ...options, maxBytes: 4 }),
		/size limit/,
	);
	assert.ok(lastResponse?.destroyed);
	pending = true;
	await assert.rejects(
		remoteFetch('http://public.test', { ...options, timeoutMs: 10 }),
		/timed out/,
	);
	await assert.rejects(
		remoteFetch('http://public.test', { lookup: () => {}, timeoutMs: 10 }),
		/timed out/,
	);
});

it('permits a local server only with private URL opt-in and passes client limits', async (t) => {
	const server = http.createServer((_request, response) => response.end('local'));
	try {
		await new Promise<void>((resolve, reject) => {
			server.once('error', reject);
			server.listen(0, '127.0.0.1', resolve);
		});
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code === 'EPERM') {
			t.skip('Sandbox forbids listening sockets');
			return;
		}
		throw error;
	}
	t.after(
		() =>
			new Promise<void>((resolve, reject) =>
				server.close((error) => (error ? reject(error) : resolve())),
			),
	);
	const address = server.address();
	assert.ok(address && typeof address !== 'string');
	const url = `http://127.0.0.1:${address.port}/`;
	assert.equal(await (await remoteFetch(url, { allowPrivate: true })).text(), 'local');
	const original = process.env.GHOSTPAW_TELEGRAM_ALLOW_PRIVATE_URLS;
	t.after(() => {
		if (original === undefined) delete process.env.GHOSTPAW_TELEGRAM_ALLOW_PRIVATE_URLS;
		else process.env.GHOSTPAW_TELEGRAM_ALLOW_PRIVATE_URLS = original;
	});
	delete process.env.GHOSTPAW_TELEGRAM_ALLOW_PRIVATE_URLS;
	let apiCalls = 0;
	const fetcher: typeof fetch = async (_url, init) => {
		apiCalls++;
		assert.ok(init?.body instanceof FormData);
		assert.equal(await (init.body.get('file0') as Blob).text(), 'local');
		return Response.json({ ok: true, result: true });
	};
	const send = (options = {}) =>
		createApiClient('secret', { fetch: fetcher, ...options }).call('sendDocument', {
			document: new InputFile({ url }),
		});
	await assert.rejects(send(), /private or local/);
	await send({ allowPrivateMediaUrls: true });
	await assert.rejects(send({ allowPrivateMediaUrls: true, mediaMaxBytes: 2 }), /size limit/);
	process.env.GHOSTPAW_TELEGRAM_ALLOW_PRIVATE_URLS = '1';
	await send();
	assert.equal(apiCalls, 2);
});

it('applies client private-target opt-ins without using the API fetcher for downloads', async (t) => {
	let downloads = 0;
	t.mock.method(
		http,
		'request',
		(
			_url: URL,
			options: http.RequestOptions,
			callback: (response: http.IncomingMessage) => void,
		) => {
			assert.equal(options.agent, false);
			return Object.assign(new EventEmitter(), {
				end() {
					downloads++;
					const response = Object.assign(new PassThrough(), { statusCode: 200, headers: {} });
					callback(response as unknown as http.IncomingMessage);
					response.end('local');
				},
			});
		},
	);
	const original = process.env.GHOSTPAW_TELEGRAM_ALLOW_PRIVATE_URLS;
	t.after(() => {
		if (original === undefined) delete process.env.GHOSTPAW_TELEGRAM_ALLOW_PRIVATE_URLS;
		else process.env.GHOSTPAW_TELEGRAM_ALLOW_PRIVATE_URLS = original;
	});
	delete process.env.GHOSTPAW_TELEGRAM_ALLOW_PRIVATE_URLS;
	const fetcher: typeof fetch = async (url, init) => {
		assert.equal(url, 'https://api.telegram.org/botsecret/sendDocument');
		assert.ok(init?.body instanceof FormData);
		assert.equal(await (init.body.get('file0') as Blob).text(), 'local');
		return Response.json({ ok: true, result: true });
	};
	const send = (options = {}) =>
		createApiClient('secret', { fetch: fetcher, ...options }).call('sendDocument', {
			document: new InputFile({ url: 'http://127.0.0.1/file' }),
		});
	await assert.rejects(send(), { code: 'TELEGRAM_FILE' });
	assert.equal(downloads, 0);
	await send({ allowPrivateMediaUrls: true });
	await assert.rejects(send({ allowPrivateMediaUrls: true, mediaMaxBytes: 2 }), /size limit/);
	process.env.GHOSTPAW_TELEGRAM_ALLOW_PRIVATE_URLS = 'true';
	await assert.rejects(send(), /private or local/);
	process.env.GHOSTPAW_TELEGRAM_ALLOW_PRIVATE_URLS = '1';
	await send();
	assert.equal(downloads, 3);
});

it('keeps the HTTPS hostname and pins IPv6 addresses', async (t) => {
	const https = (await import('node:https')).default;
	t.mock.method(
		https,
		'request',
		(
			url: URL,
			options: http.RequestOptions,
			callback: (response: http.IncomingMessage) => void,
		) => {
			assert.equal(url.hostname, 'secure.test');
			assert.equal(options.agent, false);
			assert.ok(options.lookup);
			options.lookup('secure.test', {}, (error, address, family) => {
				assert.equal(error, null);
				assert.equal(address, '2606:4700:4700::1111');
				assert.equal(family, 6);
			});
			return Object.assign(new EventEmitter(), {
				end() {
					const response = Object.assign(new PassThrough(), { statusCode: 200, headers: {} });
					callback(response as unknown as http.IncomingMessage);
					response.end('secure');
				},
			});
		},
	);
	assert.equal(
		await (
			await remoteFetch('https://secure.test/file', { lookup: lookup('2606:4700:4700::1111') })
		).text(),
		'secure',
	);
});

it('aborts a stalled response body when the overall deadline expires', async (t) => {
	let response: PassThrough | undefined;
	t.mock.method(
		http,
		'request',
		(
			_url: URL,
			options: http.RequestOptions,
			callback: (response: http.IncomingMessage) => void,
		) => {
			const request = Object.assign(new EventEmitter(), {
				end() {
					response = Object.assign(new PassThrough(), { statusCode: 200, headers: {} });
					callback(response as unknown as http.IncomingMessage);
					response.write('partial');
				},
			});
			options.signal?.addEventListener(
				'abort',
				() => {
					response?.destroy(new Error('aborted'));
					request.emit('error', new Error('aborted'));
				},
				{ once: true },
			);
			return request;
		},
	);
	await assert.rejects(
		remoteFetch('http://public.test', { lookup: lookup('8.8.8.8'), timeoutMs: 10 }),
		/timed out/,
	);
	assert.ok(response?.destroyed);
});
