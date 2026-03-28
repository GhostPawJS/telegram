import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import type { TelegramDb } from '../database.ts';
import { openTestDatabase } from '../lib/open-test-database.ts';
import { initCallbackTables } from './init_callback_tables.ts';
import { insertCallback } from './insert_callback.ts';
import type { CallbackInput } from './types.ts';

describe('insertCallback', () => {
	let db: TelegramDb;

	before(async () => {
		db = await openTestDatabase();
		initCallbackTables(db);
	});

	const base: CallbackInput = {
		callbackId: 'cb-1',
		chatId: 100,
		messageId: 50,
		userId: 200,
		data: 'action:vote',
		handler: 'vote_handler',
		payload: null,
		answeredAt: null,
		expiresAt: null,
	};

	it('inserts a callback and returns it', () => {
		const result = insertCallback(db, base, 1700000000000);

		assert.equal(result.callbackId, 'cb-1');
		assert.equal(result.chatId, 100);
		assert.equal(result.messageId, 50);
		assert.equal(result.userId, 200);
		assert.equal(result.data, 'action:vote');
		assert.equal(result.handler, 'vote_handler');
		assert.equal(result.payload, null);
		assert.equal(result.answeredAt, null);
		assert.equal(result.expiresAt, null);
		assert.equal(result.createdAt, 1700000000000);
	});

	it('second insert with same callbackId is ignored (idempotent)', () => {
		const duplicate: CallbackInput = { ...base, chatId: 999 };
		const result = insertCallback(db, duplicate, 1700000001000);

		// Should return original row, not the duplicate chatId
		assert.equal(result.chatId, 100);
		assert.equal(result.createdAt, 1700000000000);
	});

	it('round-trips payload JSON', () => {
		const withPayload: CallbackInput = {
			...base,
			callbackId: 'cb-2',
			payload: { option: 3, confirmed: true },
		};
		const result = insertCallback(db, withPayload, 1700000002000);

		assert.deepEqual(result.payload, { option: 3, confirmed: true });
	});
});
