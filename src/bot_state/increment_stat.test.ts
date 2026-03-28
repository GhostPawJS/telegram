import { strictEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';
import { openTestDatabase } from '../lib/open-test-database.ts';
import { getStats } from './get_stats.ts';
import { incrementStat, setStat } from './increment_stat.ts';
import { initBotStateTables } from './init_bot_state_tables.ts';

describe('incrementStat', () => {
	it('increments from zero', async () => {
		const db = await openTestDatabase();
		initBotStateTables(db);
		incrementStat(db, 'messages_in');
		incrementStat(db, 'messages_in');
		strictEqual(getStats(db).messagesIn, 2);
	});

	it('increments by custom amount', async () => {
		const db = await openTestDatabase();
		initBotStateTables(db);
		incrementStat(db, 'messages_out', 5);
		strictEqual(getStats(db).messagesOut, 5);
	});

	it('multiple keys are independent', async () => {
		const db = await openTestDatabase();
		initBotStateTables(db);
		incrementStat(db, 'messages_in', 3);
		incrementStat(db, 'callbacks', 1);
		const stats = getStats(db);
		strictEqual(stats.messagesIn, 3);
		strictEqual(stats.callbacks, 1);
		strictEqual(stats.messagesOut, 0);
	});
});

describe('setStat', () => {
	it('sets absolute value', async () => {
		const db = await openTestDatabase();
		initBotStateTables(db);
		setStat(db, 'last_update_id', 999);
		strictEqual(getStats(db).lastUpdateId, 999);
	});

	it('overwrites previous value', async () => {
		const db = await openTestDatabase();
		initBotStateTables(db);
		setStat(db, 'last_update_id', 1);
		setStat(db, 'last_update_id', 42);
		strictEqual(getStats(db).lastUpdateId, 42);
	});
});
