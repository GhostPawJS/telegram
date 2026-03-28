import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import type { TelegramDb } from '../database.ts';
import { openTestDatabase } from '../lib/open-test-database.ts';
import { initBotStateTables } from './init_bot_state_tables.ts';

describe('initBotStateTables', () => {
	let db: TelegramDb;

	before(async () => {
		db = await openTestDatabase();
	});

	it('runs without error', () => {
		assert.doesNotThrow(() => initBotStateTables(db));
	});

	it('is idempotent', () => {
		assert.doesNotThrow(() => initBotStateTables(db));
	});
});
