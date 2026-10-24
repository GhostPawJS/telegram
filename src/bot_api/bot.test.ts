import assert from 'node:assert/strict';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { Readable } from 'node:stream';
import { it } from 'node:test';
import { Bot, webhookCallback } from './bot.ts';

const info = { id: 99, is_bot: true, first_name: 'Bot' };
it('polls with offsets and allowed updates, dispatches in order, and aborts pending fetch on stop', async () => {
	const calls: { method: string; params: Record<string, unknown> }[] = [];
	const seen: number[] = [];
	let notify: (() => void) | undefined;
	const pending = new Promise<void>((resolve) => {
		notify = resolve;
	});
	const bot = new Bot('fake', {
		fetch: async (url, init) => {
			const method = String(url).split('/').at(-1) ?? '';
			const params = JSON.parse(String(init?.body)) as Record<string, unknown>;
			calls.push({ method, params });
			if (method === 'getMe') return Response.json({ ok: true, result: info });
			if (method === 'deleteWebhook') return Response.json({ ok: true, result: true });
			if (params.offset === 0)
				return Response.json({
					ok: true,
					result: [
						{ update_id: 10, message: { message_id: 1 } },
						{ update_id: 11, message: { message_id: 2 } },
					],
				});
			notify?.();
			return new Promise((_resolve, reject) =>
				init?.signal?.addEventListener('abort', () => reject(new Error('aborted')), { once: true }),
			);
		},
	});
	bot.on('message', (ctx) => {
		if (ctx.message) seen.push(ctx.message.message_id);
	});
	const running = bot.start();
	await pending;
	await assert.rejects(bot.start(), /already running/);
	bot.stop();
	await running;
	bot.stop();
	assert.deepEqual(seen, [1, 2]);
	assert.deepEqual(
		calls.map((x) => x.method),
		['getMe', 'deleteWebhook', 'getUpdates', 'getUpdates'],
	);
	assert.deepEqual(calls[2]?.params, { offset: 0, timeout: 30, allowed_updates: ['message'] });
	assert.deepEqual(calls[3]?.params, { offset: 12, timeout: 30, allowed_updates: ['message'] });
});
it('propagates startup failures and stops processing a batch when requested', async () => {
	const broken = new Bot('fake', {
		fetch: async () => {
			throw new Error('offline');
		},
	});
	await assert.rejects(broken.start(), /offline/);
	let count = 0;
	const bot = new Bot('fake', {
		fetch: async (url) =>
			Response.json({
				ok: true,
				result: String(url).endsWith('getMe')
					? info
					: String(url).endsWith('getUpdates')
						? [
								{ update_id: 1, message: { message_id: 1 } },
								{ update_id: 2, message: { message_id: 2 } },
							]
						: true,
			}),
	});
	bot.on('message', () => {
		count++;
		bot.stop();
	});
	await bot.start();
	assert.equal(count, 1);
});
it('initializes on webhook intake, handles unknown updates, and awaits multiple handlers', async () => {
	let requests = 0;
	const seen: string[] = [];
	const bot = new Bot('fake', {
		fetch: async () => {
			requests++;
			return Response.json({ ok: true, result: info });
		},
	});
	bot.on('message', async () => {
		seen.push('first');
	});
	bot.on('message', () => {
		seen.push('second');
	});
	await bot.handleUpdate({ update_id: 1 });
	await bot.handleUpdate({
		update_id: 2,
		message: { message_id: 1, date: 1, chat: { id: 1, type: 'private' } },
	});
	assert.equal(requests, 1);
	assert.deepEqual(seen, ['first', 'second']);
});
async function webhookRequest(
	handler: ReturnType<typeof webhookCallback>,
	data: string,
	header?: string,
) {
	const req = Readable.from([Buffer.from(data)]) as IncomingMessage;
	req.headers = header === undefined ? {} : { 'x-telegram-bot-api-secret-token': header };
	let status = 0;
	let ended = false;
	const res = {
		writeHead(code: number) {
			status = code;
			return this;
		},
		end() {
			ended = true;
		},
	} as unknown as ServerResponse;
	await handler(req, res);
	assert.equal(ended, true);
	return status;
}
it('validates webhook secrets before reading and maps successful and malformed updates', async () => {
	const bot = new Bot('fake', { fetch: async () => Response.json({ ok: true, result: info }) });
	const handler = webhookCallback(bot, 'http', { secretToken: 'shared' });
	assert.equal(await webhookRequest(handler, 'invalid'), 401);
	assert.equal(await webhookRequest(handler, 'invalid', 'wrong'), 401);
	assert.equal(await webhookRequest(handler, 'invalid', 'shared'), 500);
	assert.equal(await webhookRequest(handler, '{"update_id":1}', 'shared'), 200);
	assert.equal(await webhookRequest(webhookCallback(bot, 'http'), '{"update_id":2}'), 200);
});

it('retries polling rate limits and stops during network backoff', async () => {
	let polls = 0;
	const bot = new Bot('fake', {
		fetch: async (url) => {
			if (String(url).endsWith('getUpdates')) {
				polls++;
				if (polls === 1)
					return Response.json({
						ok: false,
						error_code: 429,
						description: 'wait',
						parameters: { retry_after: 0 },
					});
				bot.stop();
				throw new Error('aborted');
			}
			return Response.json({ ok: true, result: String(url).endsWith('getMe') ? info : true });
		},
	});
	await bot.start();
	assert.equal(polls, 2);
	const offline = new Bot('fake', {
		fetch: async (url) => {
			if (String(url).endsWith('getUpdates')) {
				setImmediate(() => offline.stop());
				throw new Error('offline');
			}
			return Response.json({ ok: true, result: info });
		},
	});
	await offline.start();
	const unauthorized = new Bot('fake', {
		fetch: async (url) =>
			Response.json(
				String(url).endsWith('getUpdates')
					? { ok: false, error_code: 401, description: 'unauthorized' }
					: { ok: true, result: info },
			),
	});
	await assert.rejects(unauthorized.start(), /401: unauthorized/);
});
