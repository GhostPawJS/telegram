import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import type { TelegramDb } from '../database.ts';
import { openTestDatabase } from '../lib/open-test-database.ts';
import { initMemberTables } from './init_member_tables.ts';

describe('initMemberTables', () => {
	let db: TelegramDb;

	before(async () => {
		db = await openTestDatabase();
	});

	it('runs without error', () => {
		assert.doesNotThrow(() => initMemberTables(db));
	});

	it('is idempotent', () => {
		assert.doesNotThrow(() => initMemberTables(db));
	});
});
