import assert from 'node:assert/strict';
import * as http from 'node:http';
import * as net from 'node:net';
import { describe, it } from 'node:test';

import { createBot } from './bot.ts';
import { createInitializedTelegramDb } from './lib/test-db.ts';

describe('createBot', () => {
	it('is a function', () => {
		assert.strictEqual(typeof createBot, 'function');
	});

	it('exposes client with api and call', async () => {
		const db = await createInitializedTelegramDb();
		const port = await getFreePort();
		const bot = createBot({ token: 'test:token', db, webhook: { path: '/wh', port } });
		assert.strictEqual(typeof bot.client, 'object');
		assert.strictEqual(typeof bot.client.api, 'object');
		assert.strictEqual(typeof bot.client.call, 'function');
		assert.strictEqual(bot.client.token, 'test:token');
		db.close();
	});
});

function getFreePort(): Promise<number> {
	return new Promise((resolve) => {
		const srv = net.createServer();
		srv.listen(0, () => {
			const port = (srv.address() as net.AddressInfo).port;
			srv.close(() => resolve(port));
		});
	});
}

describe('webhook mode', () => {
	it('server starts and start() resolves', async () => {
		const db = await createInitializedTelegramDb();
		const port = await getFreePort();
		const bot = createBot({
			token: 'test:token',
			db,
			webhook: { path: '/wh', port },
		});
		await bot.start();
		bot.stop();
		db.close();
	});

	it('POST to wrong path returns 404', async () => {
		const db = await createInitializedTelegramDb();
		const port = await getFreePort();
		const bot = createBot({
			token: 'test:token',
			db,
			webhook: { path: '/wh', port },
		});
		await bot.start();
		try {
			const statusCode = await new Promise<number>((resolve, reject) => {
				const req = http.request(
					{ hostname: '127.0.0.1', port, path: '/wrong', method: 'POST' },
					(res) => resolve(res.statusCode ?? 0),
				);
				req.on('error', reject);
				req.end();
			});
			assert.equal(statusCode, 404);
		} finally {
			bot.stop();
			db.close();
		}
	});

	it('POST to correct path with wrong secretToken returns 401', async () => {
		const db = await createInitializedTelegramDb();
		const port = await getFreePort();
		const bot = createBot({
			token: 'test:token',
			db,
			webhook: { path: '/wh', port, secretToken: 'correct' },
		});
		await bot.start();
		try {
			const statusCode = await new Promise<number>((resolve, reject) => {
				const req = http.request(
					{
						hostname: '127.0.0.1',
						port,
						path: '/wh',
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
							'X-Telegram-Bot-Api-Secret-Token': 'wrong',
						},
					},
					(res) => resolve(res.statusCode ?? 0),
				);
				req.on('error', reject);
				req.end(JSON.stringify({ update_id: 1 }));
			});
			assert.equal(statusCode, 401);
		} finally {
			bot.stop();
			db.close();
		}
	});

	it('stop() closes the server — connection attempt gets ECONNREFUSED', async () => {
		const db = await createInitializedTelegramDb();
		const port = await getFreePort();
		const bot = createBot({
			token: 'test:token',
			db,
			webhook: { path: '/wh', port },
		});
		await bot.start();
		bot.stop();
		db.close();
		// Give server time to close
		await new Promise<void>((resolve) => setTimeout(resolve, 50));
		const errCode = await new Promise<string>((resolve) => {
			const conn = net.connect(port, '127.0.0.1');
			conn.on('error', (err) => resolve((err as NodeJS.ErrnoException).code ?? ''));
		});
		assert.equal(errCode, 'ECONNREFUSED');
	});
});
