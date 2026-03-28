import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import { initChatTables } from '../chats/index.ts';
import type { TelegramDb } from '../database.ts';
import { openTestDatabase } from '../lib/open-test-database.ts';
import { initMessageTables, insertMessage } from '../messages/index.ts';
import { initUserTables } from '../users/index.ts';
import { tgSendTool } from './tg_send_tool.ts';

const CHAT_ID = 100;
const MESSAGE_ID = 1;

function initAll(db: TelegramDb): void {
	initUserTables(db);
	initChatTables(db);
	initMessageTables(db);
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

describe('tgSendTool - send_message', () => {
	let db: TelegramDb;

	before(async () => {
		db = await openTestDatabase();
		initAll(db);
	});

	it('returns toolSuccess with action data for valid text', () => {
		const result = tgSendTool.handler(db, {
			subcommand: 'send_message',
			chatId: CHAT_ID,
			text: 'Hello world',
		});
		assert.equal(result.ok, true);
		assert.equal('outcome' in result && result.outcome, 'success');
		if (result.ok) {
			const data = result.data as { action: string; chatId: number; text: string };
			assert.equal(data.action, 'send_message');
			assert.equal(data.chatId, CHAT_ID);
			assert.equal(data.text, 'Hello world');
		}
	});

	it('returns toolFailure for empty text', () => {
		const result = tgSendTool.handler(db, {
			subcommand: 'send_message',
			chatId: CHAT_ID,
			text: '',
		});
		assert.equal(result.ok, false);
		assert.equal('error' in result && result.error.code, 'invalid_input');
	});

	it('returns toolFailure for whitespace-only text', () => {
		const result = tgSendTool.handler(db, {
			subcommand: 'send_message',
			chatId: CHAT_ID,
			text: '   ',
		});
		assert.equal(result.ok, false);
		assert.equal('error' in result && result.error.code, 'invalid_input');
	});
});

describe('tgSendTool - edit_message', () => {
	let db: TelegramDb;

	before(async () => {
		db = await openTestDatabase();
		initAll(db);
	});

	it('returns toolFailure when message not found', () => {
		const result = tgSendTool.handler(db, {
			subcommand: 'edit_message',
			chatId: CHAT_ID,
			messageId: 9999,
			text: 'updated',
		});
		assert.equal(result.ok, false);
		assert.equal('error' in result && result.error.code, 'not_found');
	});

	it('returns toolSuccess with action data when message exists', () => {
		insertMessage(db, sampleMessage);
		const result = tgSendTool.handler(db, {
			subcommand: 'edit_message',
			chatId: CHAT_ID,
			messageId: MESSAGE_ID,
			text: 'updated text',
		});
		assert.equal(result.ok, true);
		assert.equal('outcome' in result && result.outcome, 'success');
		if (result.ok) {
			const data = result.data as {
				action: string;
				chatId: number;
				messageId: number;
				text: string;
			};
			assert.equal(data.action, 'edit_message');
			assert.equal(data.chatId, CHAT_ID);
			assert.equal(data.messageId, MESSAGE_ID);
			assert.equal(data.text, 'updated text');
		}
	});
});

describe('tgSendTool - delete_message', () => {
	let db: TelegramDb;

	before(async () => {
		db = await openTestDatabase();
		initAll(db);
	});

	it('returns toolFailure when message not found', () => {
		const result = tgSendTool.handler(db, {
			subcommand: 'delete_message',
			chatId: CHAT_ID,
			messageId: 9999,
		});
		assert.equal(result.ok, false);
		assert.equal('error' in result && result.error.code, 'not_found');
	});
});

describe('tgSendTool - send_typing', () => {
	let db: TelegramDb;

	before(async () => {
		db = await openTestDatabase();
		initAll(db);
	});

	it('returns toolSuccess with typing action', () => {
		const result = tgSendTool.handler(db, { subcommand: 'send_typing', chatId: CHAT_ID });
		assert.equal(result.ok, true);
		assert.equal('outcome' in result && result.outcome, 'success');
		if (result.ok) {
			const data = result.data as { action: string; chatId: number };
			assert.equal(data.action, 'send_typing');
			assert.equal(data.chatId, CHAT_ID);
		}
	});
});

describe('tgSendTool - forward_message', () => {
	let db: TelegramDb;

	before(async () => {
		db = await openTestDatabase();
		initAll(db);
	});

	it('returns toolSuccess with forward action data', () => {
		const result = tgSendTool.handler(db, {
			subcommand: 'forward_message',
			toChatId: 200,
			fromChatId: CHAT_ID,
			messageId: MESSAGE_ID,
		});
		assert.equal(result.ok, true);
		assert.equal('outcome' in result && result.outcome, 'success');
		if (result.ok) {
			const data = result.data as {
				action: string;
				toChatId: number;
				fromChatId: number;
				messageId: number;
			};
			assert.equal(data.action, 'forward_message');
			assert.equal(data.toChatId, 200);
			assert.equal(data.fromChatId, CHAT_ID);
			assert.equal(data.messageId, MESSAGE_ID);
		}
	});
});

describe('tgSendTool - pin_message', () => {
	let db: TelegramDb;
	before(async () => {
		db = await openTestDatabase();
		initAll(db);
	});

	it('returns toolFailure when message not found', () => {
		const result = tgSendTool.handler(db, {
			subcommand: 'pin_message',
			chatId: CHAT_ID,
			messageId: 9999,
		});
		assert.equal(result.ok, false);
		assert.equal('error' in result && result.error.code, 'not_found');
	});

	it('returns toolSuccess when message exists', () => {
		insertMessage(db, sampleMessage);
		const result = tgSendTool.handler(db, {
			subcommand: 'pin_message',
			chatId: CHAT_ID,
			messageId: MESSAGE_ID,
		});
		assert.equal(result.ok, true);
		if (result.ok) {
			const data = result.data as { action: string };
			assert.equal(data.action, 'pin_message');
		}
	});
});

describe('tgSendTool - unpin_message', () => {
	let db: TelegramDb;
	before(async () => {
		db = await openTestDatabase();
		initAll(db);
	});

	it('returns toolFailure when message not found', () => {
		const result = tgSendTool.handler(db, {
			subcommand: 'unpin_message',
			chatId: CHAT_ID,
			messageId: 9999,
		});
		assert.equal(result.ok, false);
	});

	it('returns toolSuccess when message exists', () => {
		insertMessage(db, sampleMessage);
		const result = tgSendTool.handler(db, {
			subcommand: 'unpin_message',
			chatId: CHAT_ID,
			messageId: MESSAGE_ID,
		});
		assert.equal(result.ok, true);
		if (result.ok) {
			const data = result.data as { action: string };
			assert.equal(data.action, 'unpin_message');
		}
	});
});
