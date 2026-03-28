import { doesNotThrow, strictEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { openTestDatabase } from '../lib/open-test-database.ts';
import { initUserTables } from './init_user_tables.ts';

describe('initUserTables', () => {
	it('runs without error on a fresh database', async () => {
		const db = await openTestDatabase();
		doesNotThrow(() => initUserTables(db));
		db.close();
	});

	it('is idempotent — calling twice does not throw', async () => {
		const db = await openTestDatabase();
		doesNotThrow(() => {
			initUserTables(db);
			initUserTables(db);
		});
		db.close();
	});

	it('creates the users table — verified by inserting a row', async () => {
		const db = await openTestDatabase();
		initUserTables(db);
		db.prepare(
			`INSERT INTO users (user_id, is_bot, username, first_name, last_name, display_name, language_code, is_premium, first_seen_at, last_seen_at)
       VALUES (1, 0, 'alice', 'Alice', null, 'Alice', 'en', 0, 1000, 1000)`,
		).run();
		const row = db.prepare('SELECT COUNT(*) AS c FROM users').get() as { c: number };
		strictEqual(row.c, 1);
		db.close();
	});
});
