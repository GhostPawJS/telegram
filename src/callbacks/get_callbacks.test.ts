import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import type { TelegramDb } from '../database.ts';
import { openTestDatabase } from '../lib/open-test-database.ts';
import { getCallbacks } from './get_callbacks.ts';
import { initCallbackTables } from './init_callback_tables.ts';
import { insertCallback } from './insert_callback.ts';

describe('getCallbacks', () => {
	let db: TelegramDb;

	before(async () => {
		db = await openTestDatabase();
		initCallbackTables(db);

		insertCallback(
			db,
			{
				callbackId: 'cb-get-1',
				chatId: 100,
				messageId: 50,
				userId: 200,
				data: 'first',
				handler: null,
				payload: null,
				answeredAt: null,
				expiresAt: null,
			},
			1700000000000,
		);

		insertCallback(
			db,
			{
				callbackId: 'cb-get-2',
				chatId: 100,
				messageId: 50,
				userId: 201,
				data: 'second',
				handler: null,
				payload: null,
				answeredAt: null,
				expiresAt: null,
			},
			1700000001000,
		);

		insertCallback(
			db,
			{
				callbackId: 'cb-get-3',
				chatId: 100,
				messageId: 99,
				userId: 202,
				data: 'other-message',
				handler: null,
				payload: null,
				answeredAt: null,
				expiresAt: null,
			},
			1700000002000,
		);
	});

	it('returns an empty array when there are no callbacks for a message', () => {
		const results = getCallbacks(db, 999, 999);
		assert.deepEqual(results, []);
	});

	it('returns entries for the given chat and message', () => {
		const results = getCallbacks(db, 100, 50);
		assert.equal(results.length, 2);
	});

	it('orders results by createdAt ascending', () => {
		const results = getCallbacks(db, 100, 50);
		assert.equal(results[0]?.callbackId, 'cb-get-1');
		assert.equal(results[1]?.callbackId, 'cb-get-2');
		assert.ok(results[0]?.createdAt <= results[1]?.createdAt);
	});

	it('does not return callbacks from other messages', () => {
		const results = getCallbacks(db, 100, 50);
		assert.ok(results.every((r) => r.messageId === 50));
	});
});
