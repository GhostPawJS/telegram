import { deepStrictEqual, strictEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { Message, MessageEntity } from 'grammy/types';

import { normalizeMessage } from './normalize_message.ts';

const baseChat = { id: -100, type: 'group' as const, title: 'Group' };
const baseFrom = { id: 10, is_bot: false, first_name: 'Alice' };

const base: Message = {
	message_id: 5,
	date: 1700000000,
	chat: baseChat,
	from: baseFrom,
} as unknown as Message;

describe('normalizeMessage', () => {
	it('maps text message fields correctly', () => {
		const msg = { ...base, text: 'hello world' } as Message;
		const result = normalizeMessage(msg, 'in', 999);
		strictEqual(result.chatId, -100);
		strictEqual(result.messageId, 5);
		strictEqual(result.direction, 'in');
		strictEqual(result.type, 'text');
		strictEqual(result.text, 'hello world');
		strictEqual(result.textPlain, 'hello world');
		strictEqual(result.fromUserId, 10);
		strictEqual(result.fromDisplayName, 'Alice');
	});

	it('converts date from seconds to milliseconds', () => {
		const msg = { ...base, text: 'hi' } as Message;
		const result = normalizeMessage(msg, 'in', 999);
		strictEqual(result.date, 1700000000 * 1000);
	});

	it('converts edit_date from seconds to milliseconds', () => {
		const msg = { ...base, text: 'edited', edit_date: 1700001000 } as Message;
		const result = normalizeMessage(msg, 'in', 999);
		strictEqual(result.editDate, 1700001000 * 1000);
	});

	it('uses caption as text for photo messages', () => {
		const msg = {
			...base,
			photo: [{ file_id: 'x', file_unique_id: 'x', width: 100, height: 100, file_size: 1000 }],
			caption: 'A photo caption',
		} as unknown as Message;
		const result = normalizeMessage(msg, 'in', 999);
		strictEqual(result.type, 'photo');
		strictEqual(result.text, 'A photo caption');
		strictEqual(result.textPlain, 'A photo caption');
	});

	it('maps service message type and serviceKind', () => {
		const msg = {
			...base,
			new_chat_members: [{ id: 20, is_bot: false, first_name: 'Bob' }],
		} as unknown as Message;
		const result = normalizeMessage(msg, 'in', 999);
		strictEqual(result.type, 'service');
		strictEqual(result.serviceKind, 'new_chat_members');
	});

	it('sets replyToMessageId and isReplyToBot for reply messages', () => {
		const botId = 999;
		const msg = {
			...base,
			text: 'reply',
			reply_to_message: {
				message_id: 3,
				from: { id: botId, is_bot: true, first_name: 'Bot' },
				date: 1699000000,
				chat: baseChat,
			},
		} as unknown as Message;
		const result = normalizeMessage(msg, 'in', botId);
		strictEqual(result.replyToMessageId, 3);
		strictEqual(result.isReplyToBot, true);
	});

	it('sets isReplyToBot=false when reply is not to bot', () => {
		const msg = {
			...base,
			text: 'reply to user',
			reply_to_message: {
				message_id: 2,
				from: { id: 55, is_bot: false, first_name: 'Other' },
				date: 1699000000,
				chat: baseChat,
			},
		} as unknown as Message;
		const result = normalizeMessage(msg, 'in', 999);
		strictEqual(result.isReplyToBot, false);
	});

	it('sets forwardOrigin when present', () => {
		const origin = { type: 'user', date: 1699000000, sender_user: baseFrom };
		const msg = { ...base, text: 'fwd', forward_origin: origin } as unknown as Message;
		const result = normalizeMessage(msg, 'in', 999);
		deepStrictEqual(result.forwardOrigin, origin);
	});

	it('extracts text_mention entities into mentions array', () => {
		const entities: MessageEntity[] = [
			{
				type: 'text_mention',
				offset: 0,
				length: 5,
				user: { id: 77, is_bot: false, first_name: 'Mentioned' },
			},
		];
		const msg = { ...base, text: '@user hello', entities } as unknown as Message;
		const result = normalizeMessage(msg, 'in', 999);
		deepStrictEqual(result.mentions, [77]);
	});

	it('sets mentionsBot=true when botUserId is in mentions', () => {
		const botId = 999;
		const entities: MessageEntity[] = [
			{
				type: 'text_mention',
				offset: 0,
				length: 5,
				user: { id: botId, is_bot: true, first_name: 'Bot' },
			},
		];
		const msg = { ...base, text: 'hey bot', entities } as unknown as Message;
		const result = normalizeMessage(msg, 'in', botId);
		strictEqual(result.mentionsBot, true);
	});

	it('sets mentionsBot=false when botUserId not in mentions', () => {
		const msg = { ...base, text: 'just a message' } as Message;
		const result = normalizeMessage(msg, 'in', 999);
		strictEqual(result.mentionsBot, false);
	});

	it('sets hasMedia=false for text message', () => {
		const msg = { ...base, text: 'no media' } as Message;
		const result = normalizeMessage(msg, 'in', 999);
		strictEqual(result.hasMedia, false);
		strictEqual(result.media, null);
	});

	it('sets hasMedia=true for photo', () => {
		const msg = {
			...base,
			photo: [{ file_id: 'p', file_unique_id: 'p', width: 100, height: 100, file_size: 500 }],
		} as unknown as Message;
		const result = normalizeMessage(msg, 'in', 999);
		strictEqual(result.hasMedia, true);
	});

	it('sets isDeleted=false and isPinned=false by default', () => {
		const msg = { ...base, text: 'x' } as Message;
		const result = normalizeMessage(msg, 'in', 999);
		strictEqual(result.isDeleted, false);
		strictEqual(result.isPinned, false);
	});

	it('sets raw to the original message object', () => {
		const msg = { ...base, text: 'raw test' } as Message;
		const result = normalizeMessage(msg, 'in', 999);
		strictEqual(result.raw === (msg as unknown as Record<string, unknown>), true);
	});

	it('sets threadId from message_thread_id', () => {
		const msg = { ...base, text: 'threaded', message_thread_id: 7 } as unknown as Message;
		const result = normalizeMessage(msg, 'in', 999);
		strictEqual(result.threadId, 7);
	});

	it('sets serviceData for new_chat_members', () => {
		const msg = {
			...base,
			new_chat_members: [{ id: 20, is_bot: false, first_name: 'Bob', username: 'bob' }],
		} as unknown as Message;
		const result = normalizeMessage(msg, 'in', 999);
		strictEqual(result.serviceData !== null, true);
		const users = (result.serviceData as Record<string, unknown>).users as Array<
			Record<string, unknown>
		>;
		strictEqual(users[0]?.id, 20);
	});

	it('sets serviceData for left_chat_member', () => {
		const msg = {
			...base,
			left_chat_member: { id: 30, is_bot: false, first_name: 'Carol', username: 'carol' },
		} as unknown as Message;
		const result = normalizeMessage(msg, 'in', 999);
		strictEqual(result.type, 'service');
		strictEqual(result.serviceKind, 'left_chat_member');
		const data = result.serviceData as Record<string, unknown>;
		strictEqual((data.user as Record<string, unknown>).id, 30);
	});

	it('sets serviceData for migrate_to_chat_id', () => {
		const msg = { ...base, migrate_to_chat_id: -999 } as unknown as Message;
		const result = normalizeMessage(msg, 'in', 999);
		strictEqual(result.serviceKind, 'migrate_to_chat_id');
		strictEqual((result.serviceData as Record<string, unknown>).newChatId, -999);
	});

	it('sets serviceData for pinned_message', () => {
		const msg = {
			...base,
			pinned_message: { message_id: 7, date: 1699000000, chat: baseChat },
		} as unknown as Message;
		const result = normalizeMessage(msg, 'in', 999);
		strictEqual(result.serviceKind, 'pinned_message');
		strictEqual((result.serviceData as Record<string, unknown>).messageId, 7);
	});

	it('sets mediaGroupId from media_group_id', () => {
		const msg = {
			...base,
			photo: [{ file_id: 'p', file_unique_id: 'p', width: 100, height: 100 }],
			media_group_id: 'album-123',
		} as unknown as Message;
		const result = normalizeMessage(msg, 'in', 999);
		strictEqual(result.mediaGroupId, 'album-123');
	});

	it('sets effectId from effect_id', () => {
		const msg = { ...base, text: 'boom', effect_id: 'effect-abc' } as unknown as Message;
		const result = normalizeMessage(msg, 'in', 999);
		strictEqual(result.effectId, 'effect-abc');
	});

	it('maps direction=out', () => {
		const msg = { ...base, text: 'outgoing' } as Message;
		const result = normalizeMessage(msg, 'out', 999);
		strictEqual(result.direction, 'out');
	});

	it('sets webAppData from web_app_data', () => {
		const msg = {
			...base,
			web_app_data: { data: 'payload', button_text: 'Open' },
		} as unknown as Message;
		const result = normalizeMessage(msg, 'in', 999);
		const data = result.webAppData as Record<string, unknown>;
		strictEqual(data.text, 'payload');
		strictEqual(data.buttonText, 'Open');
	});
});
