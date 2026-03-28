import assert from 'node:assert/strict';
import { test } from 'node:test';

import { openTestDatabase } from '../lib/open-test-database.ts';
import { initChatTables } from './init_chat_tables.ts';

test('initChatTables creates chats table', async () => {
	const db = await openTestDatabase();
	initChatTables(db);

	db.prepare(
		`INSERT INTO chats (chat_id, type, is_forum, is_active, metadata, created_at, updated_at)
		 VALUES (?, ?, ?, ?, ?, ?, ?)`,
	).run(1001, 'group', 0, 1, '{}', 1000, 1000);

	const row = db
		.prepare('SELECT * FROM chats WHERE chat_id = ?')
		.get<{ chat_id: number; type: string }>(1001);
	assert.ok(row, 'row should exist');
	assert.equal(row.chat_id, 1001);
	assert.equal(row.type, 'group');

	db.close();
});

test('initChatTables is idempotent', async () => {
	const db = await openTestDatabase();
	initChatTables(db);
	initChatTables(db);

	const row = db
		.prepare(`SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'chats'`)
		.get<{ name: string }>();
	assert.ok(row, 'chats table should exist');
	assert.equal(row.name, 'chats');

	db.close();
});
