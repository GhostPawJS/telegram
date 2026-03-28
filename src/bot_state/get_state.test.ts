import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import type { TelegramDb } from '../database.ts';
import { openTestDatabase } from '../lib/open-test-database.ts';
import { getState } from './get_state.ts';
import { initBotStateTables } from './init_bot_state_tables.ts';
import { setState } from './set_state.ts';

describe('getState', () => {
	let db: TelegramDb;

	before(async () => {
		db = await openTestDatabase();
		initBotStateTables(db);
	});

	it('returns null for a missing key', () => {
		const result = getState(db, 'does_not_exist');
		assert.equal(result, null);
	});

	it('returns the value for a set key', () => {
		setState(db, 'my_key', 'my_value', 1700000000000);
		const result = getState(db, 'my_key');
		assert.equal(result, 'my_value');
	});
});
