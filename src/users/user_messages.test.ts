import { strictEqual } from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';

import type { TelegramDb } from '../database.ts';
import { openTestDatabase } from '../lib/open-test-database.ts';
import { initUserTables } from './init_user_tables.ts';
import { upsertUser } from './upsert_user.ts';
import { userMessages } from './user_messages.ts';

function setupTables(db: TelegramDb): void {
	initUserTables(db);
	db.exec(`
    CREATE TABLE IF NOT EXISTS messages (
      chat_id      INTEGER NOT NULL,
      message_id   INTEGER NOT NULL,
      from_user_id INTEGER,
      date         INTEGER NOT NULL,
      text         TEXT,
      type         TEXT NOT NULL,
      PRIMARY KEY (chat_id, message_id)
    );
  `);
}

describe('userMessages', () => {
	let db: TelegramDb;

	beforeEach(async () => {
		db = await openTestDatabase();
		setupTables(db);
	});

	it('returns empty array when user has no messages', () => {
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

		const result = userMessages(db, 1);
		strictEqual(result.length, 0);
	});

	it('returns messages for the user ordered by date DESC', () => {
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
			`INSERT INTO messages (chat_id, message_id, from_user_id, date, text, type) VALUES (100, 1, 1, 1000, 'hello', 'text')`,
		).run();
		db.prepare(
			`INSERT INTO messages (chat_id, message_id, from_user_id, date, text, type) VALUES (100, 2, 1, 3000, 'world', 'text')`,
		).run();
		db.prepare(
			`INSERT INTO messages (chat_id, message_id, from_user_id, date, text, type) VALUES (100, 3, 1, 2000, null, 'photo')`,
		).run();

		const result = userMessages(db, 1);
		strictEqual(result.length, 3);
		strictEqual(result[0]?.messageId, 2);
		strictEqual(result[0]?.date, 3000);
		strictEqual(result[0]?.text, 'world');
		strictEqual(result[1]?.messageId, 3);
		strictEqual(result[1]?.text, null);
		strictEqual(result[1]?.type, 'photo');
		strictEqual(result[2]?.messageId, 1);
	});

	it('filters by chatId when provided', () => {
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
			`INSERT INTO messages (chat_id, message_id, from_user_id, date, text, type) VALUES (100, 1, 1, 1000, 'chat 100', 'text')`,
		).run();
		db.prepare(
			`INSERT INTO messages (chat_id, message_id, from_user_id, date, text, type) VALUES (200, 1, 1, 2000, 'chat 200', 'text')`,
		).run();

		const result = userMessages(db, 1, { chatId: 100 });
		strictEqual(result.length, 1);
		strictEqual(result[0]?.chatId, 100);
		strictEqual(result[0]?.text, 'chat 100');
	});

	it('does not return messages from other users', () => {
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
			`INSERT INTO messages (chat_id, message_id, from_user_id, date, text, type) VALUES (100, 1, 2, 1000, 'from bob', 'text')`,
		).run();

		const result = userMessages(db, 1);
		strictEqual(result.length, 0);
	});

	it('respects the limit option', () => {
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

		for (let i = 1; i <= 5; i++) {
			db.prepare(
				`INSERT INTO messages (chat_id, message_id, from_user_id, date, text, type) VALUES (100, ?, 1, ?, 'msg', 'text')`,
			).run(i, i * 1000);
		}

		const result = userMessages(db, 1, { limit: 2 });
		strictEqual(result.length, 2);
	});
});
