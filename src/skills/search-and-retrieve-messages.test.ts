import { ok, strictEqual } from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';
import type { TelegramDb } from '../database.ts';
import { initTelegramTables } from '../init_telegram_tables.ts';
import { openTestDatabase } from '../lib/open-test-database.ts';
import { applyEdit, insertMessage } from '../messages/index.ts';
import { tgReadTool } from '../tools/tg_read_tool.ts';
import { searchAndRetrieveMessages } from './search-and-retrieve-messages.ts';

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

describe('searchAndRetrieveMessages skill', () => {
	let db: TelegramDb;

	beforeEach(async () => {
		db = await openTestDatabase();
		initTelegramTables(db);
	});

	it('skill metadata', () => {
		strictEqual(typeof searchAndRetrieveMessages.name, 'string');
		ok(searchAndRetrieveMessages.name.length > 0);
		strictEqual(typeof searchAndRetrieveMessages.description, 'string');
		ok(searchAndRetrieveMessages.description.length > 0);
		strictEqual(typeof searchAndRetrieveMessages.content, 'string');
		ok(searchAndRetrieveMessages.content.length > 0);
	});

	it('FTS5 phrase search finds matching message', () => {
		insertMessage(db, msg(100, 1, 'budget proposal quarterly'));
		const result = tgReadTool.handler(db, {
			subcommand: 'search_messages',
			chatId: 100,
			query: 'budget proposal',
		});
		ok(result.ok);
		strictEqual(result.outcome, 'success');
	});

	it('FTS5 no match returns no_op not an error', () => {
		const result = tgReadTool.handler(db, {
			subcommand: 'search_messages',
			chatId: 100,
			query: 'xyzzy_impossible_phrase_99',
		});
		ok(result.ok);
		strictEqual(result.outcome, 'no_op');
	});

	it('after search, get_message retrieves full record', () => {
		insertMessage(db, msg(100, 5, 'findable text'));
		const searchResult = tgReadTool.handler(db, {
			subcommand: 'search_messages',
			chatId: 100,
			query: 'findable text',
		});
		ok(searchResult.ok);
		strictEqual(searchResult.outcome, 'success');
		const hits = (searchResult as { data: Array<{ chatId?: number; messageId?: number }> }).data;
		const first = hits?.[0];
		ok(first !== undefined);
		const chatId = first?.chatId ?? 100;
		const messageId = first?.messageId ?? 5;
		const fullResult = tgReadTool.handler(db, {
			subcommand: 'get_message',
			chatId,
			messageId,
		});
		ok(fullResult.ok);
		const fullData = (fullResult as { data: { text?: string } }).data;
		strictEqual(fullData?.text, 'findable text');
	});

	it('time-window filter: before/after scopes results correctly', () => {
		insertMessage(db, msg(100, 1, 'early', { date: 1000 }));
		insertMessage(db, msg(100, 2, 'middle', { date: 5000 }));
		insertMessage(db, msg(100, 3, 'late', { date: 9000 }));
		const result = tgReadTool.handler(db, {
			subcommand: 'list_messages',
			chatId: 100,
			after: 3000,
			before: 7000,
		});
		ok(result.ok);
		strictEqual(result.outcome, 'success');
		const data = (result as { data: unknown[] }).data;
		strictEqual(data?.length, 1);
		const first = (result as { data: Array<{ text?: string }> }).data?.[0];
		strictEqual(first?.text, 'middle');
	});

	it('threadId filter scopes to forum topic', () => {
		insertMessage(db, msg(100, 1, 'topic10a', { threadId: 10 }));
		insertMessage(db, msg(100, 2, 'topic10b', { threadId: 10 }));
		insertMessage(db, msg(100, 3, 'topic20', { threadId: 20 }));
		const result = tgReadTool.handler(db, {
			subcommand: 'list_messages',
			chatId: 100,
			threadId: 10,
		});
		ok(result.ok);
		strictEqual(result.outcome, 'success');
		const data = (result as { data: unknown[] }).data;
		strictEqual(data?.length, 2);
	});

	it('reply_chain returns root-first for 3-deep chain', () => {
		insertMessage(db, msg(100, 1, 'root'));
		insertMessage(db, msg(100, 2, 'reply', { replyToMessageId: 1 }));
		insertMessage(db, msg(100, 3, 'reply to reply', { replyToMessageId: 2 }));
		const result = tgReadTool.handler(db, {
			subcommand: 'reply_chain',
			chatId: 100,
			messageId: 3,
		});
		ok(result.ok);
		strictEqual(result.outcome, 'success');
		const chain = (result as { data: Array<{ messageId?: number }> }).data;
		ok(chain?.length > 0);
		const firstId = chain?.[0]?.messageId;
		const lastId = chain?.[chain.length - 1]?.messageId;
		ok(firstId !== undefined && lastId !== undefined);
		ok(firstId < lastId);
	});

	it('edit_history is empty before any edits', () => {
		insertMessage(db, msg(100, 1, 'unedited message'));
		const result = tgReadTool.handler(db, {
			subcommand: 'edit_history',
			chatId: 100,
			messageId: 1,
		});
		ok(result.ok);
		strictEqual(result.outcome, 'no_op');
	});

	it('edit_history shows changes after applyEdit', () => {
		insertMessage(db, msg(100, 10, 'original'));
		applyEdit(db, 100, 10, { text: 'revised', editDate: 2000 });
		const result = tgReadTool.handler(db, {
			subcommand: 'edit_history',
			chatId: 100,
			messageId: 10,
		});
		ok(result.ok);
		strictEqual(result.outcome, 'success');
		const edits = (result as { data: unknown[] }).data;
		ok(edits?.length > 0);
	});

	it('search scoped to chatId — different chat has no spillover', () => {
		insertMessage(db, msg(100, 1, 'spillover_word'));
		const result = tgReadTool.handler(db, {
			subcommand: 'search_messages',
			chatId: 200,
			query: 'spillover_word',
		});
		ok(result.ok);
		strictEqual(result.outcome, 'no_op');
	});
});
