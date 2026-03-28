import assert from 'node:assert/strict';
import { test } from 'node:test';

import { openTestDatabase } from '../lib/open-test-database.ts';
import { getChat } from './get_chat.ts';
import { initChatTables } from './init_chat_tables.ts';
import { upsertChat } from './upsert_chat.ts';

test('getChat returns null for unknown chat_id', async () => {
	const db = await openTestDatabase();
	initChatTables(db);

	const result = getChat(db, 9999);
	assert.equal(result, null);

	db.close();
});

test('getChat returns Chat for known chat_id', async () => {
	const db = await openTestDatabase();
	initChatTables(db);

	upsertChat(
		db,
		{
			chatId: 200,
			type: 'private',
			title: null,
			username: 'alice',
			firstName: 'Alice',
			lastName: 'Smith',
			isForum: false,
			memberCount: null,
			photoFileId: null,
			isActive: true,
			permissions: null,
			availableReactions: null,
			lastMessageAt: null,
			metadata: {},
		},
		5000,
	);

	const chat = getChat(db, 200);
	assert.ok(chat, 'chat should be found');
	assert.equal(chat.chatId, 200);
	assert.equal(chat.type, 'private');
	assert.equal(chat.username, 'alice');
	assert.equal(chat.firstName, 'Alice');
	assert.equal(chat.lastName, 'Smith');
	assert.equal(chat.isActive, true);

	db.close();
});
