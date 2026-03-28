import assert from 'node:assert/strict';
import { test } from 'node:test';

import { mapChatRow } from './map_chat_row.ts';
import type { ChatRow } from './types.ts';

const baseRow: ChatRow = {
	chat_id: 42,
	type: 'supergroup',
	title: 'Test Group',
	username: 'testgroup',
	first_name: null,
	last_name: null,
	is_forum: 0,
	member_count: 100,
	photo_file_id: 'abc123',
	is_active: 1,
	permissions: null,
	available_reactions: null,
	last_message_at: 9999,
	metadata: '{}',
	created_at: 1000,
	updated_at: 2000,
};

test('mapChatRow maps snake_case to camelCase', () => {
	const chat = mapChatRow(baseRow);
	assert.equal(chat.chatId, 42);
	assert.equal(chat.type, 'supergroup');
	assert.equal(chat.title, 'Test Group');
	assert.equal(chat.username, 'testgroup');
	assert.equal(chat.firstName, null);
	assert.equal(chat.lastName, null);
	assert.equal(chat.memberCount, 100);
	assert.equal(chat.photoFileId, 'abc123');
	assert.equal(chat.lastMessageAt, 9999);
	assert.equal(chat.createdAt, 1000);
	assert.equal(chat.updatedAt, 2000);
});

test('mapChatRow coerces is_forum and is_active booleans', () => {
	const active = mapChatRow({ ...baseRow, is_forum: 1, is_active: 1 });
	assert.equal(active.isForum, true);
	assert.equal(active.isActive, true);

	const inactive = mapChatRow({ ...baseRow, is_forum: 0, is_active: 0 });
	assert.equal(inactive.isForum, false);
	assert.equal(inactive.isActive, false);
});

test('mapChatRow parses JSON columns', () => {
	const row: ChatRow = {
		...baseRow,
		permissions: JSON.stringify({ can_send_messages: true }),
		available_reactions: JSON.stringify({ mode: 'subset', reactions: ['👍'] }),
		metadata: JSON.stringify({ foo: 'bar' }),
	};
	const chat = mapChatRow(row);
	assert.deepEqual(chat.permissions, { can_send_messages: true });
	assert.deepEqual(chat.availableReactions, { mode: 'subset', reactions: ['👍'] });
	assert.deepEqual(chat.metadata, { foo: 'bar' });
});

test('mapChatRow returns null for missing JSON columns', () => {
	const chat = mapChatRow({ ...baseRow, permissions: null, available_reactions: null });
	assert.equal(chat.permissions, null);
	assert.equal(chat.availableReactions, null);
});
