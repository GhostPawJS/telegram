import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import type { TelegramDb } from '../database.ts';
import { openTestDatabase } from '../lib/open-test-database.ts';
import { getStats } from './get_stats.ts';
import { initBotStateTables } from './init_bot_state_tables.ts';

describe('getStats', () => {
	describe('empty database', () => {
		let db: TelegramDb;

		before(async () => {
			db = await openTestDatabase();
			initBotStateTables(db);
		});

		it('returns zeroed BotStats without throwing', () => {
			const stats = getStats(db);

			assert.equal(stats.messagesIn, 0);
			assert.equal(stats.messagesOut, 0);
			assert.equal(stats.edits, 0);
			assert.equal(stats.deletes, 0);
			assert.equal(stats.reactions, 0);
			assert.equal(stats.callbacks, 0);
			assert.equal(stats.errors, 0);
			assert.equal(stats.lastUpdateId, null);
			assert.equal(stats.updatedAt, 0);
		});
	});

	describe('with rows', () => {
		let db: TelegramDb;

		before(async () => {
			db = await openTestDatabase();
			initBotStateTables(db);

			const insert = db.prepare(
				'INSERT INTO bot_stats (stat_key, stat_value, updated_at) VALUES (?, ?, ?)',
			);
			insert.run('messages_in', 42, 1700000001000);
			insert.run('messages_out', 10, 1700000002000);
			insert.run('edits', 3, 1700000003000);
			insert.run('deletes', 1, 1700000000000);
			insert.run('reactions', 5, 1700000000000);
			insert.run('callbacks', 7, 1700000000000);
			insert.run('errors', 2, 1700000000000);
			insert.run('last_update_id', 9999, 1700000000000);
		});

		it('returns correct values for all stat keys', () => {
			const stats = getStats(db);

			assert.equal(stats.messagesIn, 42);
			assert.equal(stats.messagesOut, 10);
			assert.equal(stats.edits, 3);
			assert.equal(stats.deletes, 1);
			assert.equal(stats.reactions, 5);
			assert.equal(stats.callbacks, 7);
			assert.equal(stats.errors, 2);
			assert.equal(stats.lastUpdateId, 9999);
		});

		it('sets updatedAt to the max updated_at among all rows', () => {
			const stats = getStats(db);
			assert.equal(stats.updatedAt, 1700000003000);
		});
	});
});
