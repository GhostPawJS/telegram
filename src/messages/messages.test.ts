import { deepStrictEqual, strictEqual, throws } from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';

import type { TelegramDb } from '../database.ts';
import { TelegramNotFoundError } from '../errors.ts';
import { openTestDatabase } from '../lib/open-test-database.ts';
import { album } from './album.ts';
import { applyEdit } from './apply_edit.ts';
import { editHistory } from './edit_history.ts';
import { getMessage } from './get_message.ts';
import { initMessageTables } from './init_message_tables.ts';
import { insertMessage } from './insert_message.ts';
import { listMessages } from './list_messages.ts';
import { replyChain } from './reply_chain.ts';
import { searchMessages } from './search_messages.ts';
import { softDelete } from './soft_delete.ts';
import { threadSummary } from './thread_summary.ts';
import type { MessageInput } from './types.ts';
import { updateMessage } from './update_message.ts';

function makeMessage(overrides: Partial<MessageInput> = {}): MessageInput {
	return {
		chatId: 100,
		messageId: 1,
		direction: 'in',
		date: 1000,
		fromUserId: 42,
		fromUsername: 'testuser',
		fromDisplayName: 'Test User',
		senderChatId: null,
		isAnonymousAdmin: false,
		viaBotId: null,
		type: 'text',
		serviceKind: null,
		text: 'Hello world',
		textPlain: 'Hello world',
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

describe('messages module', () => {
	let db: TelegramDb;

	beforeEach(async () => {
		db = await openTestDatabase();
		initMessageTables(db);
	});

	describe('insertMessage', () => {
		it('inserts a message and returns StoredMessage with correct fields', () => {
			const msg = insertMessage(db, makeMessage(), 5000);
			strictEqual(msg.chatId, 100);
			strictEqual(msg.messageId, 1);
			strictEqual(msg.direction, 'in');
			strictEqual(msg.date, 1000);
			strictEqual(msg.fromUserId, 42);
			strictEqual(msg.fromUsername, 'testuser');
			strictEqual(msg.fromDisplayName, 'Test User');
			strictEqual(msg.type, 'text');
			strictEqual(msg.text, 'Hello world');
			strictEqual(msg.isAnonymousAdmin, false);
			strictEqual(msg.mentionsBot, false);
			strictEqual(msg.hasMedia, false);
			strictEqual(msg.isDeleted, false);
			strictEqual(msg.isPinned, false);
			strictEqual(msg.firstSeenAt, 5000);
			strictEqual(msg.updatedAt, 5000);
		});

		it('is idempotent — inserting same chat_id+message_id twice returns same row', () => {
			const first = insertMessage(db, makeMessage(), 1000);
			const second = insertMessage(db, makeMessage({ text: 'Different text' }), 2000);
			strictEqual(first.text, 'Hello world');
			strictEqual(second.text, 'Hello world');
			strictEqual(second.firstSeenAt, 1000);
		});

		it('stores and restores JSON columns correctly', () => {
			const msg = insertMessage(
				db,
				makeMessage({
					entities: [{ type: 'bold', offset: 0, length: 5 }],
					mentions: [1, 2, 3],
					forwardOrigin: { type: 'user', date: 999 },
					media: { type: 'photo', file_id: 'abc' },
					raw: { update_id: 123 },
				}),
			);
			deepStrictEqual(msg.entities, [{ type: 'bold', offset: 0, length: 5 }]);
			deepStrictEqual(msg.mentions, [1, 2, 3]);
			deepStrictEqual(msg.forwardOrigin, { type: 'user', date: 999 });
			deepStrictEqual(msg.media, { type: 'photo', file_id: 'abc' });
			deepStrictEqual(msg.raw, { update_id: 123 });
		});
	});

	describe('getMessage', () => {
		it('returns null for unknown message', () => {
			const result = getMessage(db, 999, 999);
			strictEqual(result, null);
		});

		it('returns stored message by chatId + messageId', () => {
			insertMessage(db, makeMessage(), 1000);
			const msg = getMessage(db, 100, 1);
			strictEqual(msg?.messageId, 1);
			strictEqual(msg?.chatId, 100);
		});
	});

	describe('updateMessage', () => {
		it('throws TelegramNotFoundError for unknown message', () => {
			throws(
				() => updateMessage(db, 999, 999, { text: 'new' }),
				(err: unknown) => err instanceof TelegramNotFoundError,
			);
		});

		it('updates fields and sets updated_at', () => {
			insertMessage(db, makeMessage(), 1000);
			const updated = updateMessage(db, 100, 1, { text: 'Updated text', isPinned: true }, 2000);
			strictEqual(updated.text, 'Updated text');
			strictEqual(updated.isPinned, true);
			strictEqual(updated.updatedAt, 2000);
			strictEqual(updated.firstSeenAt, 1000);
		});
	});

	describe('softDelete', () => {
		it('marks message as deleted', () => {
			insertMessage(db, makeMessage(), 1000);
			softDelete(db, 100, 1, 2000);
			const msg = getMessage(db, 100, 1);
			strictEqual(msg?.isDeleted, true);
		});

		it('is idempotent — no error if already deleted', () => {
			insertMessage(db, makeMessage(), 1000);
			softDelete(db, 100, 1, 1000);
			softDelete(db, 100, 1, 2000);
			const msg = getMessage(db, 100, 1);
			strictEqual(msg?.isDeleted, true);
		});

		it('is idempotent — no error if message does not exist', () => {
			softDelete(db, 999, 999, 1000);
		});
	});

	describe('listMessages', () => {
		beforeEach(() => {
			insertMessage(
				db,
				makeMessage({ messageId: 1, direction: 'in', type: 'text', date: 1000, threadId: 10 }),
				1000,
			);
			insertMessage(
				db,
				makeMessage({ messageId: 2, direction: 'out', type: 'photo', date: 2000, threadId: 10 }),
				1000,
			);
			insertMessage(
				db,
				makeMessage({ messageId: 3, direction: 'in', type: 'text', date: 3000, threadId: 20 }),
				1000,
			);
			insertMessage(
				db,
				makeMessage({ messageId: 4, direction: 'in', type: 'text', date: 4000, isDeleted: true }),
				1000,
			);
		});

		it('returns messages ordered by date DESC', () => {
			const msgs = listMessages(db, { chatId: 100 });
			strictEqual(msgs.length >= 3, true);
			strictEqual(msgs[0]?.messageId, 3);
			strictEqual(msgs[1]?.messageId, 2);
			strictEqual(msgs[2]?.messageId, 1);
		});

		it('excludes deleted by default', () => {
			const msgs = listMessages(db, { chatId: 100 });
			strictEqual(
				msgs.some((m) => m.isDeleted),
				false,
			);
		});

		it('includes deleted when includeDeleted=true', () => {
			const msgs = listMessages(db, { chatId: 100, includeDeleted: true });
			strictEqual(
				msgs.some((m) => m.isDeleted),
				true,
			);
		});

		it('filters by direction', () => {
			const msgs = listMessages(db, { chatId: 100, direction: 'out' });
			strictEqual(msgs.length, 1);
			strictEqual(msgs[0]?.direction, 'out');
		});

		it('filters by type', () => {
			const msgs = listMessages(db, { chatId: 100, type: 'photo' });
			strictEqual(msgs.length, 1);
			strictEqual(msgs[0]?.type, 'photo');
		});

		it('filters by threadId', () => {
			const msgs = listMessages(db, { chatId: 100, threadId: 10 });
			strictEqual(msgs.length, 2);
		});

		it('filters by before', () => {
			const msgs = listMessages(db, { chatId: 100, before: 3000 });
			strictEqual(
				msgs.every((m) => m.date < 3000),
				true,
			);
		});

		it('filters by after', () => {
			const msgs = listMessages(db, { chatId: 100, after: 1000 });
			strictEqual(
				msgs.every((m) => m.date > 1000),
				true,
			);
		});

		it('respects limit and offset', () => {
			const page1 = listMessages(db, { chatId: 100, limit: 1, offset: 0 });
			const page2 = listMessages(db, { chatId: 100, limit: 1, offset: 1 });
			strictEqual(page1.length, 1);
			strictEqual(page2.length, 1);
			strictEqual(page1[0]?.messageId !== page2[0]?.messageId, true);
		});
	});

	describe('applyEdit', () => {
		it('snapshots current message to message_edits and updates text', () => {
			insertMessage(db, makeMessage({ text: 'Original', textPlain: 'Original' }), 1000);
			const updated = applyEdit(db, 100, 1, { text: 'Edited', editDate: 2000 }, 1500);
			strictEqual(updated.text, 'Edited');
			strictEqual(updated.editDate, 2000);

			const history = editHistory(db, 100, 1);
			strictEqual(history.length, 1);
			strictEqual(history[0]?.text, 'Original');
			strictEqual(history[0]?.capturedAt, 1500);
		});

		it('throws TelegramNotFoundError for unknown message', () => {
			throws(
				() => applyEdit(db, 999, 999, { text: 'X' }),
				(err: unknown) => err instanceof TelegramNotFoundError,
			);
		});
	});

	describe('editHistory', () => {
		it('returns edits in ascending capturedAt order', () => {
			insertMessage(db, makeMessage({ text: 'v1' }), 1000);
			applyEdit(db, 100, 1, { text: 'v2' }, 2000);
			applyEdit(db, 100, 1, { text: 'v3' }, 3000);

			const history = editHistory(db, 100, 1);
			strictEqual(history.length, 2);
			strictEqual(history[0]?.text, 'v1');
			strictEqual(history[0]?.capturedAt, 2000);
			strictEqual(history[1]?.text, 'v2');
			strictEqual(history[1]?.capturedAt, 3000);
		});

		it('returns empty array for message with no edits', () => {
			insertMessage(db, makeMessage(), 1000);
			deepStrictEqual(editHistory(db, 100, 1), []);
		});
	});

	describe('album', () => {
		it('returns messages in album ordered by date ASC', () => {
			insertMessage(db, makeMessage({ messageId: 1, date: 1000, mediaGroupId: 'group1' }), 1000);
			insertMessage(db, makeMessage({ messageId: 2, date: 2000, mediaGroupId: 'group1' }), 1000);
			insertMessage(db, makeMessage({ messageId: 3, date: 3000, mediaGroupId: 'group2' }), 1000);

			const msgs = album(db, 100, 'group1');
			strictEqual(msgs.length, 2);
			strictEqual(msgs[0]?.messageId, 1);
			strictEqual(msgs[1]?.messageId, 2);
		});

		it('returns empty array for unknown album', () => {
			deepStrictEqual(album(db, 100, 'unknown'), []);
		});
	});

	describe('replyChain', () => {
		it('returns chain of messages root-first', () => {
			// A (msg 1) <- B (msg 2 replies to 1) <- C (msg 3 replies to 2)
			insertMessage(db, makeMessage({ messageId: 1, date: 1000, replyToMessageId: null }), 1000);
			insertMessage(db, makeMessage({ messageId: 2, date: 2000, replyToMessageId: 1 }), 1000);
			insertMessage(db, makeMessage({ messageId: 3, date: 3000, replyToMessageId: 2 }), 1000);

			const chain = replyChain(db, 100, 3);
			strictEqual(chain.length, 3);
			strictEqual(chain[0]?.messageId, 1);
			strictEqual(chain[1]?.messageId, 2);
			strictEqual(chain[2]?.messageId, 3);
		});

		it('returns single message when no reply chain', () => {
			insertMessage(db, makeMessage({ messageId: 1, replyToMessageId: null }), 1000);
			const chain = replyChain(db, 100, 1);
			strictEqual(chain.length, 1);
			strictEqual(chain[0]?.messageId, 1);
		});

		it('returns empty array for nonexistent message', () => {
			deepStrictEqual(replyChain(db, 100, 999), []);
		});

		it('truncates chain at maxDepth', () => {
			// Chain: 1 <- 2 <- 3 <- 4 <- 5
			for (let i = 1; i <= 5; i++) {
				insertMessage(
					db,
					makeMessage({ messageId: i, date: i * 1000, replyToMessageId: i > 1 ? i - 1 : null }),
					1000,
				);
			}
			const chain = replyChain(db, 100, 5, 2);
			// maxDepth=2 means only 2 hops back: msg 5, 4, 3 (starting from 5, walk 2 levels up)
			strictEqual(chain.length <= 3, true);
		});
	});

	describe('threadSummary', () => {
		it('returns null for empty thread', () => {
			const result = threadSummary(db, 100, 99);
			strictEqual(result, null);
		});

		it('aggregates correctly', () => {
			insertMessage(
				db,
				makeMessage({ messageId: 1, date: 1000, threadId: 5, fromUserId: 10 }),
				1000,
			);
			insertMessage(
				db,
				makeMessage({ messageId: 2, date: 2000, threadId: 5, fromUserId: 20 }),
				1000,
			);
			insertMessage(
				db,
				makeMessage({ messageId: 3, date: 3000, threadId: 5, fromUserId: 10 }),
				1000,
			);

			const summary = threadSummary(db, 100, 5);
			strictEqual(summary !== null, true);
			strictEqual(summary?.total, 3);
			strictEqual(summary?.firstDate, 1000);
			strictEqual(summary?.lastDate, 3000);
			strictEqual(summary?.participantCount, 2);
			strictEqual(summary?.chatId, 100);
			strictEqual(summary?.threadId, 5);
		});

		it('excludes deleted messages from count', () => {
			insertMessage(db, makeMessage({ messageId: 1, date: 1000, threadId: 5 }), 1000);
			insertMessage(db, makeMessage({ messageId: 2, date: 2000, threadId: 5 }), 1000);
			softDelete(db, 100, 2);

			const summary = threadSummary(db, 100, 5);
			strictEqual(summary?.total, 1);
		});
	});

	describe('searchMessages (FTS5)', () => {
		it('finds inserted message by text_plain', () => {
			insertMessage(
				db,
				makeMessage({ messageId: 1, text: 'Find me please', textPlain: 'Find me please' }),
				1000,
			);
			insertMessage(
				db,
				makeMessage({ messageId: 2, text: 'Other content', textPlain: 'Other content' }),
				1000,
			);

			const results = searchMessages(db, 100, 'Find');
			strictEqual(results.length, 1);
			strictEqual(results[0]?.messageId, 1);
			strictEqual(results[0]?.chatId, 100);
			strictEqual(typeof results[0]?.snippet, 'string');
			strictEqual(results[0]?.snippet.length > 0, true);
		});

		it('does not return soft-deleted messages', () => {
			insertMessage(
				db,
				makeMessage({ messageId: 1, text: 'Searchable text', textPlain: 'Searchable text' }),
				1000,
			);
			softDelete(db, 100, 1);

			const results = searchMessages(db, 100, 'Searchable');
			strictEqual(results.length, 0);
		});

		it('returns snippet with custom highlight markers', () => {
			insertMessage(
				db,
				makeMessage({
					messageId: 1,
					text: 'Hello snippet world',
					textPlain: 'Hello snippet world',
				}),
				1000,
			);

			const results = searchMessages(db, 100, 'snippet', {
				highlightStart: '<<',
				highlightEnd: '>>',
			});
			strictEqual(results.length, 1);
			strictEqual(results[0]?.snippet.includes('<<'), true);
		});

		it('returns empty array when no match', () => {
			insertMessage(db, makeMessage({ textPlain: 'Hello world' }), 1000);
			const results = searchMessages(db, 100, 'nonexistentword');
			strictEqual(results.length, 0);
		});
	});
});
