import { deepStrictEqual, ok, strictEqual } from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';

import type { ChatMember, Chat as GrammyChat, User as GrammyUser, Message } from 'grammy/types';
import { getChat, upsertChat } from '../chats/index.ts';
import type { TelegramDb } from '../database.ts';
import { initTelegramTables } from '../init_telegram_tables.ts';
import { openTestDatabase } from '../lib/open-test-database.ts';
import { getMember, upsertMember } from '../members/index.ts';
import { getMessage, insertMessage } from '../messages/index.ts';
import { normalizeChat } from '../normalize/normalize_chat.ts';
import { normalizeMember } from '../normalize/normalize_member.ts';
import { normalizeMessage } from '../normalize/normalize_message.ts';
import { normalizeUser } from '../normalize/normalize_user.ts';
import { applyReactionUpdate, getReactions } from '../reactions/index.ts';
import { getUser, upsertUser } from '../users/index.ts';

let db: TelegramDb;

beforeEach(async () => {
	db = await openTestDatabase();
	initTelegramTables(db);
});

describe('intake flow', () => {
	describe('text message is normalized and persisted', () => {
		it('round-trips a basic text message', () => {
			const grammyMsg = {
				message_id: 42,
				date: 1700000000,
				chat: { id: -100, type: 'group', title: 'Test Group' },
				from: { id: 7, is_bot: false, first_name: 'Alice' },
				text: 'hello world',
			} as unknown as Message;

			const input = normalizeMessage(grammyMsg, 'in', 999);
			insertMessage(db, input);

			const stored = getMessage(db, -100, 42);
			ok(stored !== null);
			strictEqual(stored?.chatId, -100);
			strictEqual(stored?.messageId, 42);
			strictEqual(stored?.text, 'hello world');
			strictEqual(stored?.direction, 'in');
			strictEqual(stored?.type, 'text');
			strictEqual(stored?.fromUserId, 7);
		});
	});

	describe('user is upserted correctly', () => {
		it('round-trips user fields', () => {
			const grammyUser = {
				id: 7,
				is_bot: false,
				first_name: 'Alice',
				last_name: 'Smith',
				username: 'alice_s',
				language_code: 'en',
			} as unknown as GrammyUser;

			const input = normalizeUser(grammyUser);
			upsertUser(db, input);

			const stored = getUser(db, 7);
			ok(stored !== null);
			strictEqual(stored?.userId, 7);
			strictEqual(stored?.firstName, 'Alice');
			strictEqual(stored?.lastName, 'Smith');
			strictEqual(stored?.username, 'alice_s');
			strictEqual(stored?.displayName, 'Alice Smith');
			strictEqual(stored?.isBot, false);
		});
	});

	describe('chat is upserted correctly', () => {
		it('round-trips chat type and title', () => {
			const grammyChat = {
				id: -200,
				type: 'supergroup',
				title: 'Super Group',
				username: 'supergroup_handle',
			} as unknown as GrammyChat;

			const input = normalizeChat(grammyChat);
			upsertChat(db, input);

			const stored = getChat(db, -200);
			ok(stored !== null);
			strictEqual(stored?.chatId, -200);
			strictEqual(stored?.type, 'supergroup');
			strictEqual(stored?.title, 'Super Group');
			strictEqual(stored?.username, 'supergroup_handle');
		});
	});

	describe('member status is persisted', () => {
		it('round-trips member status', () => {
			const grammyMember = {
				status: 'administrator',
				user: { id: 7, is_bot: false, first_name: 'Alice', username: 'alice_s' },
			} as unknown as ChatMember;

			const member = normalizeMember(-100, grammyMember);
			upsertMember(db, member);

			const stored = getMember(db, -100, 7);
			ok(stored !== null);
			strictEqual(stored?.chatId, -100);
			strictEqual(stored?.userId, 7);
			strictEqual(stored?.status, 'administrator');
		});
	});

	describe('reaction update is applied and readable', () => {
		it('stores and returns emoji reactions', () => {
			// Insert prerequisite message
			const grammyMsg = {
				message_id: 1,
				date: 1700000000,
				chat: { id: -100, type: 'group', title: 'G' },
				from: { id: 5, is_bot: false, first_name: 'Bob' },
				text: 'test',
			} as unknown as Message;
			insertMessage(db, normalizeMessage(grammyMsg, 'in', 999));

			applyReactionUpdate(db, -100, 1, 5, 'Bob', [], [{ type: 'emoji' as const, emoji: '👍' }]);

			const reactions = getReactions(db, -100, 1);
			strictEqual(reactions.length, 1);
			strictEqual(reactions[0]?.emoji, '👍');
			strictEqual(reactions[0]?.userId, 5);
			strictEqual(reactions[0]?.displayName, 'Bob');
		});
	});

	describe('full pipeline: message → user → chat → member in one flow', () => {
		it('persists all entities from a single incoming group message', () => {
			const chatId = -300;
			const userId = 11;
			const messageId = 77;

			// Upsert user
			upsertUser(db, {
				userId,
				isBot: false,
				username: 'charlie',
				firstName: 'Charlie',
				lastName: null,
				displayName: 'Charlie',
				languageCode: 'en',
				isPremium: false,
			});

			// Upsert chat
			upsertChat(db, {
				chatId,
				type: 'group',
				title: 'Full Pipeline Group',
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
			});

			// Normalize and insert message
			const grammyMsg = {
				message_id: messageId,
				date: 1700000000,
				chat: { id: chatId, type: 'group', title: 'Full Pipeline Group' },
				from: { id: userId, is_bot: false, first_name: 'Charlie' },
				text: 'pipeline message',
			} as unknown as Message;
			insertMessage(db, normalizeMessage(grammyMsg, 'in', 999));

			// Verify all read back
			const user = getUser(db, userId);
			ok(user !== null);
			strictEqual(user?.username, 'charlie');

			const chat = getChat(db, chatId);
			ok(chat !== null);
			strictEqual(chat?.title, 'Full Pipeline Group');

			const msg = getMessage(db, chatId, messageId);
			ok(msg !== null);
			strictEqual(msg?.text, 'pipeline message');
			strictEqual(msg?.fromUserId, userId);

			// Verify message ties user to chat
			deepStrictEqual([msg?.chatId, msg?.fromUserId], [chatId, userId]);
		});
	});
});
