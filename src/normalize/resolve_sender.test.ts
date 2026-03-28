import { strictEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { Message } from 'grammy/types';

import { resolveSender } from './resolve_sender.ts';

const baseChat = { id: 1, type: 'group' as const, title: 'Group' };

describe('resolveSender', () => {
	it('sets fromUserId and fromDisplayName when from is present', () => {
		const msg = {
			message_id: 1,
			date: 1000,
			chat: baseChat,
			from: { id: 42, is_bot: false, first_name: 'Alice' },
		} as unknown as Message;
		const result = resolveSender(msg);
		strictEqual(result.fromUserId, 42);
		strictEqual(result.fromDisplayName, 'Alice');
		strictEqual(result.fromUsername, null);
		strictEqual(result.senderChatId, null);
		strictEqual(result.isAnonymousAdmin, false);
	});

	it('includes last_name in fromDisplayName', () => {
		const msg = {
			message_id: 1,
			date: 1000,
			chat: baseChat,
			from: { id: 42, is_bot: false, first_name: 'Alice', last_name: 'Smith', username: 'alice' },
		} as unknown as Message;
		const result = resolveSender(msg);
		strictEqual(result.fromDisplayName, 'Alice Smith');
		strictEqual(result.fromUsername, 'alice');
	});

	it('sets senderChatId and isAnonymousAdmin when sender_chat is present', () => {
		const msg = {
			message_id: 1,
			date: 1000,
			chat: baseChat,
			sender_chat: { id: -100999, type: 'channel' as const, title: 'Chan' },
		} as unknown as Message;
		const result = resolveSender(msg);
		strictEqual(result.senderChatId, -100999);
		strictEqual(result.isAnonymousAdmin, true);
		strictEqual(result.fromUserId, null);
		strictEqual(result.fromDisplayName, 'Unknown');
	});

	it('sets both from and sender_chat fields when both are present', () => {
		const msg = {
			message_id: 1,
			date: 1000,
			chat: baseChat,
			from: { id: 99, is_bot: false, first_name: 'Admin' },
			sender_chat: { id: -100777, type: 'channel' as const, title: 'Chan' },
		} as unknown as Message;
		const result = resolveSender(msg);
		strictEqual(result.fromUserId, 99);
		strictEqual(result.senderChatId, -100777);
		strictEqual(result.isAnonymousAdmin, true);
	});

	it('returns Unknown display name when neither from nor sender_chat', () => {
		const msg = {
			message_id: 1,
			date: 1000,
			chat: baseChat,
		} as unknown as Message;
		const result = resolveSender(msg);
		strictEqual(result.fromUserId, null);
		strictEqual(result.fromUsername, null);
		strictEqual(result.fromDisplayName, 'Unknown');
		strictEqual(result.senderChatId, null);
		strictEqual(result.isAnonymousAdmin, false);
	});
});
