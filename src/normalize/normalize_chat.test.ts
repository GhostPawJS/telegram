import { strictEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { Chat } from 'grammy/types';

import { normalizeChat } from './normalize_chat.ts';

describe('normalizeChat', () => {
	it('maps private chat correctly', () => {
		const chat: Chat = { id: 123, type: 'private', first_name: 'Alice', username: 'alice' };
		const result = normalizeChat(chat);
		strictEqual(result.chatId, 123);
		strictEqual(result.type, 'private');
		strictEqual(result.title, null);
		strictEqual(result.firstName, 'Alice');
		strictEqual(result.username, 'alice');
		strictEqual(result.isForum, false);
		strictEqual(result.isActive, true);
		strictEqual(result.memberCount, null);
	});

	it('maps group chat correctly', () => {
		const chat: Chat = { id: -100, type: 'group', title: 'My Group' };
		const result = normalizeChat(chat);
		strictEqual(result.type, 'group');
		strictEqual(result.title, 'My Group');
		strictEqual(result.firstName, null);
	});

	it('maps supergroup with is_forum=true', () => {
		const chat: Chat = {
			id: -100999,
			type: 'supergroup',
			title: 'Forum Group',
			is_forum: true,
		} as Chat;
		const result = normalizeChat(chat);
		strictEqual(result.type, 'supergroup');
		strictEqual(result.isForum, true);
	});

	it('maps channel correctly', () => {
		const chat: Chat = { id: -1001234, type: 'channel', title: 'My Channel', username: 'mychan' };
		const result = normalizeChat(chat);
		strictEqual(result.type, 'channel');
		strictEqual(result.title, 'My Channel');
		strictEqual(result.username, 'mychan');
	});

	it('sets default values', () => {
		const chat: Chat = { id: 1, type: 'private', first_name: 'X' };
		const result = normalizeChat(chat);
		strictEqual(result.photoFileId, null);
		strictEqual(result.permissions, null);
		strictEqual(result.availableReactions, null);
		strictEqual(result.lastMessageAt, null);
	});
});
