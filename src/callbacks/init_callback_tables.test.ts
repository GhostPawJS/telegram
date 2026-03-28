import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import type { TelegramDb } from '../database.ts';
import { openTestDatabase } from '../lib/open-test-database.ts';
import { initCallbackTables } from './init_callback_tables.ts';

describe('initCallbackTables', () => {
	let db: TelegramDb;

	before(async () => {
		db = await openTestDatabase();
	});

	it('runs without error', () => {
		assert.doesNotThrow(() => initCallbackTables(db));
	});

	it('is idempotent', () => {
		assert.doesNotThrow(() => initCallbackTables(db));
	});
});
