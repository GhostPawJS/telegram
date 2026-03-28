import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import type { TelegramDb } from '../database.ts';
import { openTestDatabase } from '../lib/open-test-database.ts';
import { getState } from './get_state.ts';
import { initBotStateTables } from './init_bot_state_tables.ts';
import { setState } from './set_state.ts';

describe('setState', () => {
	let db: TelegramDb;

	before(async () => {
		db = await openTestDatabase();
		initBotStateTables(db);
	});

	it('set then get returns the value', () => {
		setState(db, 'token', 'abc123', 1700000000000);
		assert.equal(getState(db, 'token'), 'abc123');
	});

	it('update then get returns the new value', () => {
		setState(db, 'token', 'abc123', 1700000000000);
		setState(db, 'token', 'xyz789', 1700000001000);
		assert.equal(getState(db, 'token'), 'xyz789');
	});

	it('sets multiple independent keys', () => {
		setState(db, 'key_a', 'value_a', 1700000000000);
		setState(db, 'key_b', 'value_b', 1700000000000);
		assert.equal(getState(db, 'key_a'), 'value_a');
		assert.equal(getState(db, 'key_b'), 'value_b');
	});
});
