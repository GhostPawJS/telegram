import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';

import type { TelegramDb } from '../database.ts';
import { initTelegramTables } from '../init_telegram_tables.ts';
import { openTestDatabase } from '../lib/open-test-database.ts';
import { tgConnectTool } from './tg_connect_tool.ts';

describe('tgConnectTool', () => {
	describe('get_stats', () => {
		let db: TelegramDb;

		before(async () => {
			db = await openTestDatabase();
			initTelegramTables(db);
		});

		it('returns BotStats on success', () => {
			const result = tgConnectTool.handler(db, { subcommand: 'get_stats' });
			assert.equal(result.ok, true);
			assert.equal('outcome' in result && result.outcome, 'success');
			if (result.ok) {
				const stats = result.data as Record<string, unknown>;
				assert.equal(typeof stats.messagesIn, 'number');
				assert.equal(typeof stats.messagesOut, 'number');
				assert.equal(typeof stats.errors, 'number');
			}
		});
	});

	describe('get_state', () => {
		let db: TelegramDb;

		before(async () => {
			db = await openTestDatabase();
			initTelegramTables(db);
		});

		it('returns toolNoOp for unknown key', () => {
			const result = tgConnectTool.handler(db, { subcommand: 'get_state', key: 'nonexistent_key' });
			assert.equal(result.ok, true);
			assert.equal('outcome' in result && result.outcome, 'no_op');
		});
	});

	describe('list_chats', () => {
		let db: TelegramDb;

		before(async () => {
			db = await openTestDatabase();
			initTelegramTables(db);
		});

		it('returns toolNoOp when no chats exist', () => {
			const result = tgConnectTool.handler(db, { subcommand: 'list_chats' });
			assert.equal(result.ok, true);
		});
	});
});

describe('tgConnectTool - get_state with value', () => {
	let db: TelegramDb;
	before(async () => {
		db = await openTestDatabase();
		initTelegramTables(db);
	});

	it('returns toolSuccess when state key exists', () => {
		// Set state directly via SQL
		db.prepare('INSERT INTO bot_state(key, value, updated_at) VALUES (?, ?, ?)').run(
			'mykey',
			'myvalue',
			1000,
		);
		const result = tgConnectTool.handler(db, { subcommand: 'get_state', key: 'mykey' });
		assert.equal(result.ok, true);
		assert.equal('outcome' in result && result.outcome, 'success');
		if (result.ok) {
			const data = result.data as { key: string; value: string };
			assert.equal(data.value, 'myvalue');
		}
	});
});

describe('tgConnectTool - list_chats with data', () => {
	let db: TelegramDb;
	before(async () => {
		db = await openTestDatabase();
		initTelegramTables(db);
	});

	it('returns toolSuccess when chats exist', () => {
		// Insert a chat directly
		db.prepare(
			`INSERT INTO chats(chat_id, type, is_forum, is_active, metadata, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
		).run(-100, 'group', 0, 1, '{}', 1000, 1000);
		const result = tgConnectTool.handler(db, { subcommand: 'list_chats' });
		assert.equal(result.ok, true);
		assert.equal('outcome' in result && result.outcome, 'success');
	});
});
