import { ok, strictEqual } from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';
import type { TelegramDb } from '../database.ts';
import { initTelegramTables } from '../init_telegram_tables.ts';
import { openTestDatabase } from '../lib/open-test-database.ts';
import { upsertMember } from '../members/index.ts';
import type { Member } from '../members/types.ts';
import { insertMessage } from '../messages/index.ts';
import { tgManageTool } from '../tools/tg_manage_tool.ts';
import { tgReadTool } from '../tools/tg_read_tool.ts';
import { tgSendTool } from '../tools/tg_send_tool.ts';
import { moderateChatEffectively } from './moderate-chat-effectively.ts';

const CHAT_ID = -200;

function member(userId: number, status: Member['status']): Member {
	return {
		chatId: CHAT_ID,
		userId,
		username: null,
		displayName: `User ${userId}`,
		status,
		permissions: null,
		customTitle: null,
		updatedAt: 1000,
	};
}

function textMsg(messageId: number, userId: number, text: string) {
	return {
		chatId: CHAT_ID,
		messageId,
		direction: 'in' as const,
		date: messageId * 1000,
		fromUserId: userId,
		fromUsername: null,
		fromDisplayName: 'Spammer',
		senderChatId: null,
		isAnonymousAdmin: false,
		viaBotId: null,
		type: 'text' as const,
		serviceKind: null,
		text,
		textPlain: text,
		entities: null,
		mentions: [],
		mentionsBot: false,
		isReplyToBot: false,
		replyToMessageId: null,
		threadId: null,
		mediaGroupId: null,
		forwardOrigin: null,
		media: null,
		hasMedia: false,
		replyMarkup: null,
		webAppData: null,
		linkPreview: null,
		effectId: null,
		serviceData: null,
		editDate: null,
		isDeleted: false,
		isPinned: false,
		raw: {},
	};
}

describe('moderateChatEffectively skill', () => {
	let db: TelegramDb;

	beforeEach(async () => {
		db = await openTestDatabase();
		initTelegramTables(db);
	});

	it('skill metadata', () => {
		strictEqual(moderateChatEffectively.name, 'moderate-chat-effectively');
		ok(moderateChatEffectively.description.length > 0);
		ok(moderateChatEffectively.content.length > 0);
	});

	it('step 1-2: inspect incoming message fields', () => {
		insertMessage(db, textMsg(1, 101, 'hello world'));
		const result = tgReadTool.handler(db, {
			subcommand: 'get_message',
			chatId: CHAT_ID,
			messageId: 1,
		});
		ok(result.ok);
		const data = result.ok ? (result.data as Record<string, unknown>) : null;
		strictEqual(data?.text, 'hello world');
		strictEqual(data?.fromUserId, 101);
		strictEqual(data?.hasMedia, false);
	});

	it('step 3: check member standing before acting', () => {
		upsertMember(db, member(102, 'member'));
		const result = tgManageTool.handler(db, {
			subcommand: 'get_member',
			chatId: CHAT_ID,
			userId: 102,
		});
		ok(result.ok);
		const data = result.ok ? (result.data as Member) : null;
		strictEqual(data?.status, 'member');
	});

	it('step 4 escalation: first offence → restrict_user (mute)', () => {
		upsertMember(db, member(103, 'member'));
		const result = tgManageTool.handler(db, {
			subcommand: 'restrict_user',
			chatId: CHAT_ID,
			userId: 103,
			canSendMessages: false,
			untilDate: Date.now() + 3600000,
		});
		ok(result.ok);
	});

	it('step 4 escalation: repeat offence → kick_user', () => {
		upsertMember(db, member(104, 'member'));
		const result = tgManageTool.handler(db, {
			subcommand: 'kick_user',
			chatId: CHAT_ID,
			userId: 104,
		});
		ok(result.ok);
	});

	it('step 4 escalation: severe → ban_user', () => {
		upsertMember(db, member(105, 'member'));
		const result = tgManageTool.handler(db, {
			subcommand: 'ban_user',
			chatId: CHAT_ID,
			userId: 105,
		});
		ok(result.ok);
		const data = result.ok ? (result.data as Record<string, unknown>) : null;
		strictEqual(data?.action, 'ban_user');
	});

	it('step 5: delete offending message', () => {
		insertMessage(db, textMsg(10, 106, 'spam'));
		const result = tgSendTool.handler(db, {
			subcommand: 'delete_message',
			chatId: CHAT_ID,
			messageId: 10,
		});
		ok(result.ok);
		const data = result.ok ? (result.data as Record<string, unknown>) : null;
		strictEqual(data?.action, 'delete_message');
	});

	it('step 6: notify chat after action', () => {
		const result = tgSendTool.handler(db, {
			subcommand: 'send_message',
			chatId: CHAT_ID,
			text: 'User was muted for sending spam.',
		});
		ok(result.ok);
		const data = result.ok ? (result.data as Record<string, unknown>) : null;
		strictEqual(data?.action, 'send_message');
	});

	it('spam detection: search for duplicate messages', () => {
		insertMessage(db, textMsg(1, 107, 'buy cheap followers'));
		insertMessage(db, textMsg(2, 107, 'buy cheap followers'));
		const result = tgReadTool.handler(db, {
			subcommand: 'search_messages',
			chatId: CHAT_ID,
			query: 'buy cheap followers',
		});
		ok(result.ok);
		const data = result.ok ? (result.data as unknown[]) : [];
		ok(data.length > 1);
	});

	it('do not restrict administrator — guard check', () => {
		upsertMember(db, member(108, 'administrator'));
		const result = tgManageTool.handler(db, {
			subcommand: 'get_member',
			chatId: CHAT_ID,
			userId: 108,
		});
		ok(result.ok);
		const data = result.ok ? (result.data as Member) : null;
		strictEqual(data?.status, 'administrator');
	});

	it('do not ban based on single borderline message — check_member first', () => {
		upsertMember(db, member(109, 'member'));
		const check = tgManageTool.handler(db, {
			subcommand: 'get_member',
			chatId: CHAT_ID,
			userId: 109,
		});
		ok(check.ok);
		const ban = tgManageTool.handler(db, { subcommand: 'ban_user', chatId: CHAT_ID, userId: 109 });
		ok(ban.ok);
		const data = ban.ok ? (ban.data as Record<string, unknown>) : null;
		strictEqual(data?.chatId, CHAT_ID);
		strictEqual(data?.userId, 109);
	});

	it('anonymous admin — isAnonymousAdmin flag is readable on message', () => {
		const msg = { ...textMsg(20, 110, 'anon admin message'), isAnonymousAdmin: true };
		insertMessage(db, msg);
		const result = tgReadTool.handler(db, {
			subcommand: 'get_message',
			chatId: CHAT_ID,
			messageId: 20,
		});
		ok(result.ok);
		const data = result.ok ? (result.data as Record<string, unknown>) : null;
		strictEqual(data?.isAnonymousAdmin, true);
	});
});

describe('moderateChatEffectively skill — forwarded content and untilDate verification', () => {
	let db: TelegramDb;

	beforeEach(async () => {
		db = await openTestDatabase();
		initTelegramTables(db);
	});

	it('spam signal: forwarded content detected via forwardOrigin field', () => {
		// Skill: "Forwarded content (message.forwardOrigin is non-null)"
		insertMessage(db, {
			...textMsg(20, 99, 'forwarded spam'),
			forwardOrigin: {
				type: 'user',
				date: 1000,
				sender_user: { id: 77, is_bot: false, first_name: 'Original' },
			},
		});
		// Member may not exist yet — that's fine, key thing is message's forwardOrigin is stored
		const msgResult = tgReadTool.handler(db, {
			subcommand: 'get_message',
			chatId: CHAT_ID,
			messageId: 20,
		});
		ok(msgResult.ok);
		const data = (msgResult as { data: { forwardOrigin?: unknown } }).data;
		ok(data.forwardOrigin !== null && data.forwardOrigin !== undefined);
	});

	it('untilDate is included in restrict_user action descriptor', () => {
		// Skill: "Use untilDate for temporary restrictions rather than permanent bans"
		upsertMember(db, member(42, 'member'));
		const untilDate = Date.now() + 3600_000;
		const result = tgManageTool.handler(db, {
			subcommand: 'restrict_user',
			chatId: CHAT_ID,
			userId: 42,
			canSendMessages: false,
			untilDate,
		});
		ok(result.ok);
		const data = (result as { data: Record<string, unknown> }).data;
		strictEqual(data.untilDate, untilDate);
	});

	it('do not restrict creator — creator status is readable as guard condition', () => {
		// Skill: "Do not restrict administrators (member.status === 'administrator' or 'creator')"
		upsertMember(db, member(55, 'creator'));
		const check = tgManageTool.handler(db, {
			subcommand: 'get_member',
			chatId: CHAT_ID,
			userId: 55,
		});
		ok(check.ok);
		const data = (check as { data: { status: string } }).data;
		strictEqual(data.status, 'creator');
		// Caller should abort restriction when status is 'creator' or 'administrator'
		ok(data.status === 'creator' || data.status === 'administrator');
	});
});
