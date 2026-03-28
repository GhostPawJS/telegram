import { ok, strictEqual } from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';
import type { TelegramDb } from '../database.ts';
import { initTelegramTables } from '../init_telegram_tables.ts';
import { openTestDatabase } from '../lib/open-test-database.ts';
import { album, insertMessage } from '../messages/index.ts';
import { tgReadTool } from '../tools/tg_read_tool.ts';
import { manageTelegramConversations } from './manage-telegram-conversations.ts';

function msg(
	chatId: number,
	messageId: number,
	text: string,
	overrides: Record<string, unknown> = {},
) {
	return {
		chatId,
		messageId,
		direction: 'in' as const,
		date: messageId * 1000,
		fromUserId: 1,
		fromUsername: null,
		fromDisplayName: 'Alice',
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
		...overrides,
	};
}

describe('manageTelegramConversations skill', () => {
	let db: TelegramDb;

	beforeEach(async () => {
		db = await openTestDatabase();
		initTelegramTables(db);
	});

	it('skill metadata is correct', () => {
		strictEqual(typeof manageTelegramConversations.name, 'string');
		ok(manageTelegramConversations.name.length > 0);
		strictEqual(typeof manageTelegramConversations.description, 'string');
		ok(manageTelegramConversations.description.length > 0);
		strictEqual(typeof manageTelegramConversations.content, 'string');
		ok(manageTelegramConversations.content.length > 0);
	});

	it('get_message — fetching a specific message by id', () => {
		insertMessage(db, msg(100, 1, 'hello'));
		const result = tgReadTool.handler(db, { subcommand: 'get_message', chatId: 100, messageId: 1 });
		ok(result.ok);
		strictEqual(result.outcome, 'success');
		const data = (result as { data: { text?: string } }).data;
		strictEqual(data?.text, 'hello');
	});

	it('get_message — unknown message returns not_found gracefully', () => {
		const result = tgReadTool.handler(db, {
			subcommand: 'get_message',
			chatId: 100,
			messageId: 9999,
		});
		strictEqual(result.ok, false);
		strictEqual(result.outcome, 'error');
		const failure = result as { error: { code: string } };
		strictEqual(failure.error?.code, 'not_found');
	});

	it('list_messages — paginating recent messages', () => {
		for (let i = 1; i <= 5; i++) {
			insertMessage(db, msg(100, i, `message ${i}`));
		}
		const result = tgReadTool.handler(db, {
			subcommand: 'list_messages',
			chatId: 100,
			limit: 3,
		});
		ok(result.ok);
		strictEqual(result.outcome, 'success');
		const data = (result as { data: unknown[] }).data;
		strictEqual(data?.length, 3);
	});

	it('list_messages — empty chat returns no_op', () => {
		const result = tgReadTool.handler(db, { subcommand: 'list_messages', chatId: 100 });
		ok(result.ok);
		strictEqual(result.outcome, 'no_op');
	});

	it('list_messages — time window filter (before/after)', () => {
		insertMessage(db, msg(100, 1, 'early', { date: 1000 }));
		insertMessage(db, msg(100, 2, 'middle', { date: 5000 }));
		insertMessage(db, msg(100, 3, 'late', { date: 9000 }));
		const result = tgReadTool.handler(db, {
			subcommand: 'list_messages',
			chatId: 100,
			after: 2000,
			before: 8000,
		});
		ok(result.ok);
		strictEqual(result.outcome, 'success');
		const data = (result as { data: unknown[] }).data;
		strictEqual(data?.length, 1);
		const first = (result as { data: Array<{ text?: string }> }).data?.[0];
		strictEqual(first?.text, 'middle');
	});

	it('list_messages — thread filtering', () => {
		insertMessage(db, msg(100, 1, 'thread7a', { threadId: 7 }));
		insertMessage(db, msg(100, 2, 'thread7b', { threadId: 7 }));
		insertMessage(db, msg(100, 3, 'thread8', { threadId: 8 }));
		const result = tgReadTool.handler(db, {
			subcommand: 'list_messages',
			chatId: 100,
			threadId: 7,
		});
		ok(result.ok);
		strictEqual(result.outcome, 'success');
		const data = (result as { data: unknown[] }).data;
		strictEqual(data?.length, 2);
	});

	it('reply_chain — reconstructs context root-first', () => {
		insertMessage(db, msg(100, 1, 'root'));
		insertMessage(db, msg(100, 2, 'child', { replyToMessageId: 1 }));
		insertMessage(db, msg(100, 3, 'grandchild', { replyToMessageId: 2 }));
		const result = tgReadTool.handler(db, {
			subcommand: 'reply_chain',
			chatId: 100,
			messageId: 3,
		});
		ok(result.ok);
		strictEqual(result.outcome, 'success');
		const data = (result as { data: unknown[] }).data;
		ok(data?.length > 0);
	});

	it('search_messages — finds message by text', () => {
		insertMessage(db, msg(100, 1, 'quarterly_budget_review'));
		const result = tgReadTool.handler(db, {
			subcommand: 'search_messages',
			chatId: 100,
			query: 'quarterly_budget_review',
		});
		ok(result.ok);
		strictEqual(result.outcome, 'success');
	});

	it('search_messages — no match returns no_op (not an error)', () => {
		const result = tgReadTool.handler(db, {
			subcommand: 'search_messages',
			chatId: 100,
			query: 'xyzzy_never_exists',
		});
		ok(result.ok);
		strictEqual(result.outcome, 'no_op');
	});

	it('search_messages — snippet-based result requires get_message for full data', () => {
		insertMessage(db, msg(100, 42, 'findable_unique_content'));
		const searchResult = tgReadTool.handler(db, {
			subcommand: 'search_messages',
			chatId: 100,
			query: 'findable_unique_content',
		});
		ok(searchResult.ok);
		strictEqual(searchResult.outcome, 'success');
		const hits = (searchResult as { data: Array<{ chatId?: number; messageId?: number }> }).data;
		const first = hits?.[0];
		ok(first !== undefined);
		const chatId = first?.chatId ?? 100;
		const messageId = first?.messageId ?? 42;
		const fullResult = tgReadTool.handler(db, {
			subcommand: 'get_message',
			chatId,
			messageId,
		});
		ok(fullResult.ok);
		const fullData = (fullResult as { data: { text?: string; textPlain?: string } }).data;
		ok(fullData?.text !== undefined || fullData?.textPlain !== undefined);
	});
});

describe('manageTelegramConversations skill — album retrieval', () => {
	let db: TelegramDb;

	beforeEach(async () => {
		db = await openTestDatabase();
		initTelegramTables(db);
	});

	it('album: messages with same mediaGroupId are fetched together', () => {
		// Skill: "Messages with the same mediaGroupId are part of a media album"
		insertMessage(
			db,
			msg(100, 10, 'photo 1', { mediaGroupId: 'album-abc', type: 'photo' as const }),
		);
		insertMessage(
			db,
			msg(100, 11, 'photo 2', { mediaGroupId: 'album-abc', type: 'photo' as const }),
		);
		insertMessage(db, msg(100, 12, 'unrelated', { mediaGroupId: null }));

		// Use album() from the messages surface — the correct API for media group retrieval
		const members = album(db, 100, 'album-abc');
		strictEqual(members.length, 2);
		ok(members.every((m) => m.mediaGroupId === 'album-abc'));
	});

	it('ok field check: get_message on missing id does not throw — returns failure gracefully', () => {
		// Skill: "Do not assume a message exists — always check the ok field before using data"
		const result = tgReadTool.handler(db, {
			subcommand: 'get_message',
			chatId: 100,
			messageId: 9999,
		});
		// Must not throw, must signal failure via ok=false
		strictEqual(result.ok, false);
		ok('error' in result);
		strictEqual(result.error.code, 'not_found');
	});
});
