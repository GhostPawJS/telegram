import assert from 'node:assert/strict';
import { test } from 'node:test';

import { openTestDatabase } from '../lib/open-test-database.ts';
import { initChatTables } from './init_chat_tables.ts';
import { listChats } from './list_chats.ts';
import type { ChatInput } from './types.ts';
import { upsertChat } from './upsert_chat.ts';

function makeChat(overrides: Partial<ChatInput> & { chatId: number }): ChatInput {
	return {
		type: 'group',
		title: null,
		username: null,
		firstName: null,
		lastName: null,
		isForum: false,
		memberCount: null,
		photoFileId: null,
		isActive: true,
		permissions: null,
		availableReactions: null,
		lastMessageAt: null,
		metadata: {},
		...overrides,
	};
}

test('listChats returns empty array when no chats exist', async () => {
	const db = await openTestDatabase();
	initChatTables(db);

	const result = listChats(db);
	assert.deepEqual(result, []);

	db.close();
});

test('listChats returns all chats without filter', async () => {
	const db = await openTestDatabase();
	initChatTables(db);

	upsertChat(db, makeChat({ chatId: 1, type: 'private' }), 1000);
	upsertChat(db, makeChat({ chatId: 2, type: 'group' }), 1000);
	upsertChat(db, makeChat({ chatId: 3, type: 'channel' }), 1000);

	const result = listChats(db);
	assert.equal(result.length, 3);

	db.close();
});

test('listChats filters by type', async () => {
	const db = await openTestDatabase();
	initChatTables(db);

	upsertChat(db, makeChat({ chatId: 10, type: 'private' }), 1000);
	upsertChat(db, makeChat({ chatId: 11, type: 'group' }), 1000);
	upsertChat(db, makeChat({ chatId: 12, type: 'group' }), 1000);
	upsertChat(db, makeChat({ chatId: 13, type: 'channel' }), 1000);

	const groups = listChats(db, { type: 'group' });
	assert.equal(groups.length, 2);
	assert.ok(groups.every((c) => c.type === 'group'));

	const channels = listChats(db, { type: 'channel' });
	assert.equal(channels.length, 1);
	assert.equal(channels[0]?.chatId, 13);

	db.close();
});

test('listChats filters by isActive', async () => {
	const db = await openTestDatabase();
	initChatTables(db);

	upsertChat(db, makeChat({ chatId: 20, isActive: true }), 1000);
	upsertChat(db, makeChat({ chatId: 21, isActive: true }), 1000);
	upsertChat(db, makeChat({ chatId: 22, isActive: false }), 1000);

	const active = listChats(db, { isActive: true });
	assert.equal(active.length, 2);
	assert.ok(active.every((c) => c.isActive === true));

	const inactive = listChats(db, { isActive: false });
	assert.equal(inactive.length, 1);
	assert.equal(inactive[0]?.chatId, 22);

	db.close();
});

test('listChats orders by last_message_at DESC NULLS LAST', async () => {
	const db = await openTestDatabase();
	initChatTables(db);

	upsertChat(db, makeChat({ chatId: 30, lastMessageAt: 1000 }), 1000);
	upsertChat(db, makeChat({ chatId: 31, lastMessageAt: 3000 }), 1000);
	upsertChat(db, makeChat({ chatId: 32, lastMessageAt: null }), 1000);
	upsertChat(db, makeChat({ chatId: 33, lastMessageAt: 2000 }), 1000);

	const result = listChats(db);
	const ids = result.map((c) => c.chatId);
	assert.deepEqual(ids, [31, 33, 30, 32]);

	db.close();
});

test('listChats respects limit and offset', async () => {
	const db = await openTestDatabase();
	initChatTables(db);

	for (let i = 0; i < 5; i++) {
		upsertChat(db, makeChat({ chatId: 40 + i, lastMessageAt: (5 - i) * 1000 }), 1000);
	}

	const page1 = listChats(db, { limit: 2, offset: 0 });
	assert.equal(page1.length, 2);

	const page2 = listChats(db, { limit: 2, offset: 2 });
	assert.equal(page2.length, 2);

	assert.notEqual(page1[0]?.chatId, page2[0]?.chatId);

	db.close();
});
