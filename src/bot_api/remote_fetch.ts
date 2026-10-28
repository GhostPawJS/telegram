import { lookup as dnsLookup } from 'node:dns';
import http from 'node:http';
import https from 'node:https';
import { isIP } from 'node:net';
import { TelegramFileError } from '../errors.ts';

export interface RemoteFetchOptions {
	allowPrivate?: boolean;
	maxBytes?: number;
	timeoutMs?: number;
	maxRedirects?: number;
	lookup?: (
		hostname: string,
		options: { all: true },
		callback: (
			error: NodeJS.ErrnoException | null,
			addresses: { address: string; family: number }[],
		) => void,
	) => void;
}

function privateV4(address: string): boolean {
	const [a = 0, b = 0, c = 0] = address.split('.').map(Number);
	return (
		a === 0 ||
		a === 10 ||
		a === 127 ||
		(a === 100 && b >= 64 && b <= 127) ||
		(a === 169 && b === 254) ||
		(a === 172 && b >= 16 && b <= 31) ||
		(a === 192 && (b === 168 || (b === 0 && c === 0))) ||
		(a === 198 && (b === 18 || b === 19)) ||
		a >= 224
	);
}

function isPrivate(address: string): boolean {
	if (isIP(address) === 4) return privateV4(address);
	if (isIP(address) !== 6) return true;
	// Canonicalize dotted tails and expand compressed IPv6 before checking mapped addresses.
	let normalized = new URL(`http://[${address}]/`).hostname.slice(1, -1);
	normalized = normalized.split('%')[0] ?? normalized;
	const halves = normalized.split('::');
	const left = halves[0] ? halves[0].split(':') : [];
	const right = halves[1] ? halves[1].split(':') : [];
	const words = (
		halves.length === 2
			? [...left, ...Array(8 - left.length - right.length).fill('0'), ...right]
			: left
	).map((word) => Number.parseInt(word, 16));
	const first = words[0] ?? 0;
	if (words.slice(0, 5).every((word) => word === 0) && (words[5] === 0 || words[5] === 0xffff)) {
		const high = words[6] ?? 0;
		const low = words[7] ?? 0;
		return privateV4(`${high >> 8}.${high & 255}.${low >> 8}.${low & 255}`);
	}
	// NAT64 (64:ff9b::/96) and 6to4 (2002::/16) carry an IPv4 address that must pass the same check.
	if (first === 0x64 && words[1] === 0xff9b && words.slice(2, 6).every((word) => word === 0)) {
		const high = words[6] ?? 0;
		const low = words[7] ?? 0;
		return privateV4(`${high >> 8}.${high & 255}.${low >> 8}.${low & 255}`);
	}
	if (first === 0x2002) {
		const high = words[1] ?? 0;
		const low = words[2] ?? 0;
		return privateV4(`${high >> 8}.${high & 255}.${low >> 8}.${low & 255}`);
	}
	return (first & 0xfe00) === 0xfc00 || (first & 0xffc0) === 0xfe80 || (first & 0xff00) === 0xff00;
}

/** Download media with a pinned DNS result and one deadline for the entire operation. */
export async function remoteFetch(input: string, options: RemoteFetchOptions = {}): Promise<Blob> {
	const maxBytes = options.maxBytes ?? 50 * 1024 * 1024;
	const timeoutMs = options.timeoutMs ?? 30_000;
	const maxRedirects = options.maxRedirects ?? 5;
	if (
		!Number.isSafeInteger(maxBytes) ||
		maxBytes < 0 ||
		!Number.isFinite(timeoutMs) ||
		timeoutMs <= 0 ||
		!Number.isSafeInteger(maxRedirects) ||
		maxRedirects < 0
	) {
		throw new TelegramFileError('Invalid media download limits.');
	}
	const controller = new AbortController();
	const timeoutError = new TelegramFileError('Media URL download timed out.');
	let rejectDeadline: (error: Error) => void = () => {};
	const deadline = new Promise<never>((_, reject) => {
		rejectDeadline = reject;
	});
	const timer = setTimeout(() => {
		controller.abort();
		rejectDeadline(timeoutError);
	}, timeoutMs);
	async function download(): Promise<Blob> {
		let url: URL;
		try {
			url = new URL(input);
		} catch {
			throw new TelegramFileError('Media URL is invalid.');
		}
		for (let hops = 0; ; hops++) {
			if (controller.signal.aborted) throw timeoutError;
			if (url.protocol !== 'http:' && url.protocol !== 'https:')
				throw new TelegramFileError('Media URL blocked: only http: and https: are allowed.');
			const hostname = url.hostname.replace(/^\[|\]$/g, '');
			const addresses = isIP(hostname)
				? [{ address: hostname, family: isIP(hostname) }]
				: await new Promise<{ address: string; family: number }[]>((resolve, reject) => {
						(options.lookup ?? dnsLookup)(hostname, { all: true }, (error, results) =>
							error
								? reject(new TelegramFileError('Media URL DNS lookup failed.'))
								: resolve(results),
						);
					});
			if (controller.signal.aborted) throw timeoutError;
			if (!addresses.length)
				throw new TelegramFileError('Media URL DNS lookup returned no addresses.');
			for (const { address } of addresses) {
				if (!isIP(address) || (!options.allowPrivate && isPrivate(address)))
					throw new TelegramFileError(
						`Media URL blocked: resolves to a private or local address (${isIP(address) ? address : 'invalid address'}). Set allowPrivateMediaUrls to allow.`,
					);
			}
			const selected = addresses[0];
			if (!selected) throw new TelegramFileError('Media URL DNS lookup returned no addresses.');
			const response = await new Promise<http.IncomingMessage>((resolve, reject) => {
				const request = (url.protocol === 'https:' ? https : http).request(
					url,
					{
						signal: controller.signal,
						agent: false,
						// Keep URL hostname for Host and TLS SNI; never resolve it again at connection time.
						lookup: (_host, opts, callback) => {
							if (opts.all) callback(null, [selected]);
							else callback(null, selected.address, selected.family);
						},
					},
					resolve,
				);
				request.on('error', () => reject(new TelegramFileError('Media URL download failed.')));
				request.end();
			});
			const status = response.statusCode ?? 0;
			if ([301, 302, 303, 307, 308].includes(status) && response.headers.location) {
				response.destroy();
				if (hops >= maxRedirects) throw new TelegramFileError('Media URL exceeded redirect limit.');
				try {
					url = new URL(response.headers.location, url);
				} catch {
					throw new TelegramFileError('Media URL redirect is invalid.');
				}
				continue;
			}
			if (status < 200 || status >= 300) {
				response.destroy();
				throw new TelegramFileError(`Media URL download failed: HTTP ${status}.`);
			}
			if (Number(response.headers['content-length']) > maxBytes) {
				response.destroy();
				throw new TelegramFileError('Media URL exceeds download size limit.');
			}
			const chunks: Uint8Array<ArrayBuffer>[] = [];
			let size = 0;
			for await (const chunk of response) {
				size += chunk.length;
				if (size > maxBytes) {
					response.destroy();
					throw new TelegramFileError('Media URL exceeds download size limit.');
				}
				chunks.push(new Uint8Array(chunk));
			}
			return new Blob(chunks);
		}
	}
	try {
		return await Promise.race([download(), deadline]);
	} catch (error) {
		if (controller.signal.aborted) throw timeoutError;
		if (error instanceof TelegramFileError) throw error;
		throw new TelegramFileError('Media URL download failed.');
	} finally {
		clearTimeout(timer);
	}
}
