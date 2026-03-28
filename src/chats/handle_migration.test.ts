import assert from 'node:assert/strict';
import { test } from 'node:test';

import { openTestDatabase } from '../lib/open-test-database.ts';
import { getChat } from './get_chat.ts';
import { handleMigration } from './handle_migration.ts';
import { initChatTables } from './init_chat_tables.ts';
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

test('handleMigration marks old chat inactive and sets metadata', async () => {
	const db = await openTestDatabase();
	initChatTables(db);

	upsertChat(db, makeChat({ chatId: 1000, type: 'group' }), 1000);
	upsertChat(db, makeChat({ chatId: 2000, type: 'supergroup' }), 1000);

	handleMigration(db, 1000, 2000, 5000);

	const oldChat = getChat(db, 1000);
	assert.ok(oldChat, 'old chat should still exist');
	assert.equal(oldChat.isActive, false, 'old chat should be inactive');
	assert.equal(oldChat.metadata.migratedToChatId, 2000);
	assert.equal(oldChat.metadata.migratedAt, 5000);

	const newChat = getChat(db, 2000);
	assert.ok(newChat, 'new chat should exist');
	assert.equal(newChat.metadata.migratedFromChatId, 1000);
	assert.equal(newChat.metadata.migratedAt, 5000);

	db.close();
});

test('handleMigration is a no-op for unknown chat IDs', async () => {
	const db = await openTestDatabase();
	initChatTables(db);

	// Should not throw when neither chat exists
	assert.doesNotThrow(() => {
		handleMigration(db, 9999, 8888, 1000);
	});

	db.close();
});

test('handleMigration preserves existing metadata on old chat', async () => {
	const db = await openTestDatabase();
	initChatTables(db);

	upsertChat(
		db,
		makeChat({ chatId: 300, type: 'group', metadata: { existingKey: 'value' } }),
		1000,
	);
	upsertChat(db, makeChat({ chatId: 400, type: 'supergroup' }), 1000);

	handleMigration(db, 300, 400, 7000);

	const oldChat = getChat(db, 300);
	assert.ok(oldChat);
	assert.equal(oldChat.metadata.existingKey, 'value');
	assert.equal(oldChat.metadata.migratedToChatId, 400);

	db.close();
});
