import { strictEqual } from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';

import type { TelegramDb } from '../database.ts';
import { openTestDatabase } from '../lib/open-test-database.ts';
import { initUserTables } from './init_user_tables.ts';
import { upsertUser } from './upsert_user.ts';
import { userChats } from './user_chats.ts';

function setupTables(db: TelegramDb): void {
	initUserTables(db);
	db.exec(`
    CREATE TABLE IF NOT EXISTS chats (chat_id INTEGER PRIMARY KEY, type TEXT NOT NULL, title TEXT, username TEXT, is_active INTEGER NOT NULL DEFAULT 1, last_message_at INTEGER);
    CREATE TABLE IF NOT EXISTS members (chat_id INTEGER NOT NULL, user_id INTEGER NOT NULL, PRIMARY KEY(chat_id, user_id));
  `);
}

describe('userChats', () => {
	let db: TelegramDb;

	beforeEach(async () => {
		db = await openTestDatabase();
		setupTables(db);
	});

	it('returns empty array when user has no memberships', () => {
		upsertUser(
			db,
			{
				userId: 1,
				isBot: false,
				username: 'alice',
				firstName: 'Alice',
				lastName: null,
				displayName: 'Alice',
				languageCode: null,
				isPremium: false,
			},
			1000,
		);

		const result = userChats(db, 1);
		strictEqual(result.length, 0);
	});

	it('returns chats the user is a member of', () => {
		upsertUser(
			db,
			{
				userId: 1,
				isBot: false,
				username: 'alice',
				firstName: 'Alice',
				lastName: null,
				displayName: 'Alice',
				languageCode: null,
				isPremium: false,
			},
			1000,
		);

		db.prepare(
			`INSERT INTO chats (chat_id, type, title, username, is_active, last_message_at) VALUES (100, 'group', 'My Group', null, 1, 5000)`,
		).run();
		db.prepare(
			`INSERT INTO chats (chat_id, type, title, username, is_active, last_message_at) VALUES (200, 'private', null, 'bob', 1, 3000)`,
		).run();
		db.prepare(`INSERT INTO members (chat_id, user_id) VALUES (100, 1)`).run();
		db.prepare(`INSERT INTO members (chat_id, user_id) VALUES (200, 1)`).run();

		const result = userChats(db, 1);
		strictEqual(result.length, 2);
		// ordered by last_message_at DESC
		strictEqual(result[0]?.chatId, 100);
		strictEqual(result[0]?.type, 'group');
		strictEqual(result[0]?.title, 'My Group');
		strictEqual(result[0]?.isActive, true);
		strictEqual(result[1]?.chatId, 200);
		strictEqual(result[1]?.username, 'bob');
	});

	it('does not return chats where user is not a member', () => {
		upsertUser(
			db,
			{
				userId: 1,
				isBot: false,
				username: 'alice',
				firstName: 'Alice',
				lastName: null,
				displayName: 'Alice',
				languageCode: null,
				isPremium: false,
			},
			1000,
		);
		upsertUser(
			db,
			{
				userId: 2,
				isBot: false,
				username: 'bob',
				firstName: 'Bob',
				lastName: null,
				displayName: 'Bob',
				languageCode: null,
				isPremium: false,
			},
			1000,
		);

		db.prepare(
			`INSERT INTO chats (chat_id, type, title, username, is_active) VALUES (100, 'group', 'Alice Group', null, 1)`,
		).run();
		db.prepare(`INSERT INTO members (chat_id, user_id) VALUES (100, 1)`).run();

		const result = userChats(db, 2);
		strictEqual(result.length, 0);
	});

	it('maps is_active=0 to isActive=false', () => {
		upsertUser(
			db,
			{
				userId: 1,
				isBot: false,
				username: 'alice',
				firstName: 'Alice',
				lastName: null,
				displayName: 'Alice',
				languageCode: null,
				isPremium: false,
			},
			1000,
		);

		db.prepare(
			`INSERT INTO chats (chat_id, type, title, username, is_active) VALUES (100, 'group', 'Old Group', null, 0)`,
		).run();
		db.prepare(`INSERT INTO members (chat_id, user_id) VALUES (100, 1)`).run();

		const result = userChats(db, 1);
		strictEqual(result.length, 1);
		strictEqual(result[0]?.isActive, false);
	});
});
