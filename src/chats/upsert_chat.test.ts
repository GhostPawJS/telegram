import assert from 'node:assert/strict';
import { test } from 'node:test';

import { openTestDatabase } from '../lib/open-test-database.ts';
import { initChatTables } from './init_chat_tables.ts';
import type { ChatInput } from './types.ts';
import { upsertChat } from './upsert_chat.ts';

const baseInput: ChatInput = {
	chatId: 100,
	type: 'group',
	title: 'My Group',
	username: null,
	firstName: null,
	lastName: null,
	isForum: false,
	memberCount: 5,
	photoFileId: null,
	isActive: true,
	permissions: null,
	availableReactions: null,
	lastMessageAt: null,
	metadata: {},
};

test('upsertChat inserts a new chat', async () => {
	const db = await openTestDatabase();
	initChatTables(db);

	const chat = upsertChat(db, baseInput, 1000);
	assert.equal(chat.chatId, 100);
	assert.equal(chat.type, 'group');
	assert.equal(chat.title, 'My Group');
	assert.equal(chat.memberCount, 5);
	assert.equal(chat.isActive, true);
	assert.equal(chat.createdAt, 1000);
	assert.equal(chat.updatedAt, 1000);

	db.close();
});

test('upsertChat updates on second call, preserves createdAt', async () => {
	const db = await openTestDatabase();
	initChatTables(db);

	upsertChat(db, baseInput, 1000);
	const updated = upsertChat(db, { ...baseInput, title: 'Renamed Group', memberCount: 10 }, 2000);

	assert.equal(updated.title, 'Renamed Group');
	assert.equal(updated.memberCount, 10);
	assert.equal(updated.createdAt, 1000);
	assert.equal(updated.updatedAt, 2000);

	db.close();
});

test('upsertChat JSON columns survive round-trip', async () => {
	const db = await openTestDatabase();
	initChatTables(db);

	const input: ChatInput = {
		...baseInput,
		permissions: { can_send_messages: true, can_pin_messages: false },
		availableReactions: { mode: 'subset', reactions: ['👍', '❤️'] },
		metadata: { source: 'bot', version: 2 },
	};

	const chat = upsertChat(db, input, 1000);
	assert.deepEqual(chat.permissions, { can_send_messages: true, can_pin_messages: false });
	assert.deepEqual(chat.availableReactions, { mode: 'subset', reactions: ['👍', '❤️'] });
	assert.deepEqual(chat.metadata, { source: 'bot', version: 2 });

	db.close();
});
