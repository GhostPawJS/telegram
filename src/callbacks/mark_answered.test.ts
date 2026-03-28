import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import type { TelegramDb } from '../database.ts';
import { TelegramNotFoundError } from '../errors.ts';
import { openTestDatabase } from '../lib/open-test-database.ts';
import { initCallbackTables } from './init_callback_tables.ts';
import { insertCallback } from './insert_callback.ts';
import { markAnswered } from './mark_answered.ts';
import type { CallbackRow } from './types.ts';

describe('markAnswered', () => {
	let db: TelegramDb;

	before(async () => {
		db = await openTestDatabase();
		initCallbackTables(db);
		insertCallback(
			db,
			{
				callbackId: 'cb-mark-1',
				chatId: 100,
				messageId: 50,
				userId: 200,
				data: null,
				handler: null,
				payload: null,
				answeredAt: null,
				expiresAt: null,
			},
			1700000000000,
		);
	});

	it('marks a callback as answered', () => {
		markAnswered(db, 'cb-mark-1', 1700000005000);

		const row = db
			.prepare('SELECT answered_at FROM callbacks WHERE callback_id = ?')
			.get<Pick<CallbackRow, 'answered_at'>>('cb-mark-1');

		assert.ok(row !== undefined);
		assert.equal(row.answered_at, 1700000005000);
	});

	it('throws TelegramNotFoundError for an unknown callbackId', () => {
		assert.throws(
			() => markAnswered(db, 'cb-does-not-exist', 1700000006000),
			(err: unknown) => {
				assert.ok(err instanceof TelegramNotFoundError);
				return true;
			},
		);
	});
});
