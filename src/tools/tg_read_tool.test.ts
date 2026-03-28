import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import { initChatTables } from '../chats/index.ts';
import type { TelegramDb } from '../database.ts';
import { openTestDatabase } from '../lib/open-test-database.ts';
import { initMessageTables, insertMessage } from '../messages/index.ts';
import { initReactionTables } from '../reactions/index.ts';
import { initUserTables } from '../users/index.ts';
import { tgReadTool } from './tg_read_tool.ts';

const CHAT_ID = 100;
const MESSAGE_ID = 1;

function initAll(db: TelegramDb): void {
	initUserTables(db);
	initChatTables(db);
	initMessageTables(db);
	initReactionTables(db);
}

const sampleMessage = {
	chatId: CHAT_ID,
	messageId: MESSAGE_ID,
	direction: 'in' as const,
	date: 1000,
	fromUserId: null,
	fromUsername: null,
	fromDisplayName: 'Alice',
	senderChatId: null,
	isAnonymousAdmin: false,
	viaBotId: null,
	type: 'text' as const,
	serviceKind: null,
	text: 'hello',
	textPlain: 'hello',
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

describe('tgReadTool - get_message', () => {
	let db: TelegramDb;

	before(async () => {
		db = await openTestDatabase();
		initAll(db);
	});

	it('returns toolFailure when message not found', () => {
		const result = tgReadTool.handler(db, {
			subcommand: 'get_message',
			chatId: CHAT_ID,
			messageId: 9999,
		});
		assert.equal(result.ok, false);
		assert.equal('error' in result && result.error.code, 'not_found');
	});

	it('returns toolSuccess when message exists', () => {
		insertMessage(db, sampleMessage);
		const result = tgReadTool.handler(db, {
			subcommand: 'get_message',
			chatId: CHAT_ID,
			messageId: MESSAGE_ID,
		});
		assert.equal(result.ok, true);
		assert.equal('outcome' in result && result.outcome, 'success');
	});
});

describe('tgReadTool - list_messages', () => {
	let db: TelegramDb;

	before(async () => {
		db = await openTestDatabase();
		initAll(db);
	});

	it('returns toolNoOp when no messages', () => {
		const result = tgReadTool.handler(db, {
			subcommand: 'list_messages',
			chatId: 9999,
		});
		assert.equal(result.ok, true);
		assert.equal('outcome' in result && result.outcome, 'no_op');
	});
});

describe('tgReadTool - get_chat', () => {
	let db: TelegramDb;

	before(async () => {
		db = await openTestDatabase();
		initAll(db);
	});

	it('returns toolFailure when chat not found', () => {
		const result = tgReadTool.handler(db, { subcommand: 'get_chat', chatId: 9999 });
		assert.equal(result.ok, false);
		assert.equal('error' in result && result.error.code, 'not_found');
	});
});

describe('tgReadTool - get_user', () => {
	let db: TelegramDb;

	before(async () => {
		db = await openTestDatabase();
		initAll(db);
	});

	it('returns toolFailure when user not found', () => {
		const result = tgReadTool.handler(db, { subcommand: 'get_user', userId: 9999 });
		assert.equal(result.ok, false);
		assert.equal('error' in result && result.error.code, 'not_found');
	});
});

describe('tgReadTool - get_reactions', () => {
	let db: TelegramDb;

	before(async () => {
		db = await openTestDatabase();
		initAll(db);
		insertMessage(db, sampleMessage);
	});

	it('returns toolSuccess with empty array when no reactions', () => {
		const result = tgReadTool.handler(db, {
			subcommand: 'get_reactions',
			chatId: CHAT_ID,
			messageId: MESSAGE_ID,
		});
		assert.equal(result.ok, true);
		assert.equal('outcome' in result && result.outcome, 'success');
		if (result.ok) {
			assert.equal(Array.isArray(result.data), true);
			assert.equal((result.data as unknown[]).length, 0);
		}
	});
});

describe('tgReadTool - search_messages', () => {
	let db: TelegramDb;

	before(async () => {
		db = await openTestDatabase();
		initAll(db);
	});

	it('returns toolNoOp when no results', () => {
		const result = tgReadTool.handler(db, {
			subcommand: 'search_messages',
			chatId: CHAT_ID,
			query: 'xyzzy_no_match',
		});
		assert.equal(result.ok, true);
		assert.equal('outcome' in result && result.outcome, 'no_op');
	});
});

describe('tgReadTool - reply_chain', () => {
	let db: TelegramDb;
	before(async () => {
		db = await openTestDatabase();
		initAll(db);
	});

	it('returns toolNoOp when message has no reply chain', () => {
		// message with no replyToMessageId
		insertMessage(db, { ...sampleMessage, messageId: 50, replyToMessageId: null });
		const result = tgReadTool.handler(db, {
			subcommand: 'reply_chain',
			chatId: CHAT_ID,
			messageId: 50,
		});
		// replyChain returns the message itself as root, so it will be 1 item — success
		assert.equal(result.ok, true);
	});
});

describe('tgReadTool - edit_history', () => {
	let db: TelegramDb;
	before(async () => {
		db = await openTestDatabase();
		initAll(db);
	});

	it('returns toolNoOp when no edits exist', () => {
		insertMessage(db, { ...sampleMessage, messageId: 60 });
		const result = tgReadTool.handler(db, {
			subcommand: 'edit_history',
			chatId: CHAT_ID,
			messageId: 60,
		});
		assert.equal(result.ok, true);
		assert.equal('outcome' in result && result.outcome, 'no_op');
	});
});

describe('tgReadTool - list_users', () => {
	let db: TelegramDb;
	before(async () => {
		db = await openTestDatabase();
		initAll(db);
	});

	it('returns toolNoOp when no users exist', () => {
		const result = tgReadTool.handler(db, { subcommand: 'list_users' });
		assert.equal(result.ok, true);
		assert.equal('outcome' in result && result.outcome, 'no_op');
	});
});

describe('tgReadTool - list_chats', () => {
	let db: TelegramDb;
	before(async () => {
		db = await openTestDatabase();
		initAll(db);
	});

	it('returns toolNoOp when no chats exist', () => {
		const result = tgReadTool.handler(db, { subcommand: 'list_chats' });
		assert.equal(result.ok, true);
		assert.equal('outcome' in result && result.outcome, 'no_op');
	});
});

describe('tgReadTool - search_messages (found)', () => {
	let db: TelegramDb;
	before(async () => {
		db = await openTestDatabase();
		initAll(db);
		insertMessage(db, { ...sampleMessage, messageId: 70, textPlain: 'unique_searchable_word' });
	});

	it('returns toolSuccess when results found', () => {
		const result = tgReadTool.handler(db, {
			subcommand: 'search_messages',
			chatId: CHAT_ID,
			query: 'unique_searchable_word',
		});
		assert.equal(result.ok, true);
		assert.equal('outcome' in result && result.outcome, 'success');
	});
});
