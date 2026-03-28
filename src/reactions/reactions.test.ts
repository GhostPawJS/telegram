import { deepStrictEqual, strictEqual } from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';

import type { TelegramDb } from '../database.ts';
import { openTestDatabase } from '../lib/open-test-database.ts';
import { applyReactionCounts } from './apply_reaction_counts.ts';
import { applyReactionUpdate } from './apply_reaction_update.ts';
import { getReactionCounts } from './get_reaction_counts.ts';
import { getReactions } from './get_reactions.ts';
import { initReactionTables } from './init_reaction_tables.ts';
import type { ReactionEventRow } from './types.ts';
import { userReactions } from './user_reactions.ts';

describe('reactions module', () => {
	let db: TelegramDb;

	beforeEach(async () => {
		db = await openTestDatabase();
		initReactionTables(db);
	});

	describe('applyReactionUpdate', () => {
		it('adds reactions — getReactions returns expected rows', () => {
			applyReactionUpdate(db, 100, 1, 42, 'Alice', [], ['👍', '❤️'], 1000);
			const reactions = getReactions(db, 100, 1);
			strictEqual(reactions.length, 2);
			const emojis = reactions.map((r) => r.emoji).sort();
			deepStrictEqual(emojis, ['❤️', '👍']);
			strictEqual(reactions[0]?.userId, 42);
			strictEqual(reactions[0]?.displayName, 'Alice');
			strictEqual(reactions[0]?.emojiType, 'emoji');
		});

		it('removes reactions — second call with empty newReactions returns []', () => {
			applyReactionUpdate(db, 100, 1, 42, 'Alice', [], ['👍'], 1000);
			applyReactionUpdate(db, 100, 1, 42, 'Alice', ['👍'], [], 2000);
			const reactions = getReactions(db, 100, 1);
			deepStrictEqual(reactions, []);
		});

		it('creates reaction_events for added and removed emojis', () => {
			applyReactionUpdate(db, 100, 1, 42, 'Alice', [], ['👍', '❤️'], 1000);
			applyReactionUpdate(db, 100, 1, 42, 'Alice', ['👍', '❤️'], ['👍', '🔥'], 2000);

			const events = db
				.prepare(
					'SELECT * FROM reaction_events WHERE chat_id=? AND message_id=? AND user_id=? ORDER BY event_at, action, emoji',
				)
				.all<ReactionEventRow>(100, 1, 42);

			// First call: 2 add events
			const addEvents = events.filter((e) => e.action === 'add');
			const removeEvents = events.filter((e) => e.action === 'remove');

			strictEqual(addEvents.length, 3); // 👍, ❤️ from first call; 🔥 from second
			strictEqual(removeEvents.length, 1); // ❤️ removed in second call

			const removedEmojis = removeEvents.map((e) => e.emoji);
			strictEqual(removedEmojis.includes('❤️'), true);

			const addedEmojisSecondCall = addEvents
				.filter((e) => e.event_at === 2000)
				.map((e) => e.emoji);
			strictEqual(addedEmojisSecondCall.includes('🔥'), true);
		});

		it('idempotency — calling with same reactions twice produces no net events on second call', () => {
			applyReactionUpdate(db, 100, 1, 42, 'Alice', [], ['👍'], 1000);

			const countBefore = db
				.prepare('SELECT COUNT(*) as cnt FROM reaction_events')
				.get<{ cnt: number }>()?.cnt;

			// Second call with same old+new — no diff, no events
			applyReactionUpdate(db, 100, 1, 42, 'Alice', ['👍'], ['👍'], 2000);

			const countAfter = db
				.prepare('SELECT COUNT(*) as cnt FROM reaction_events')
				.get<{ cnt: number }>()?.cnt;

			strictEqual(countAfter, countBefore);
		});

		it('handles custom_emoji reaction type', () => {
			const customEmoji = { type: 'custom_emoji' as const, customEmojiId: 'id-123' };
			applyReactionUpdate(db, 100, 5, 42, 'Alice', [], [customEmoji], 1000);
			const reactions = getReactions(db, 100, 5);
			strictEqual(reactions.length, 1);
			strictEqual(reactions[0]?.emojiType, 'custom_emoji');
			strictEqual(reactions[0]?.emoji, 'id-123');
		});

		it('handles paid reaction type', () => {
			const paid = { type: 'paid' as const };
			applyReactionUpdate(db, 100, 6, 42, 'Alice', [], [paid], 1000);
			const reactions = getReactions(db, 100, 6);
			strictEqual(reactions.length, 1);
			strictEqual(reactions[0]?.emojiType, 'paid');
		});
	});

	describe('applyReactionCounts', () => {
		it('sets aggregate counts', () => {
			applyReactionCounts(
				db,
				100,
				1,
				[
					{ emoji: '👍', emojiType: 'emoji', count: 5 },
					{ emoji: '❤️', emojiType: 'emoji', count: 3 },
				],
				1000,
			);

			const counts = getReactionCounts(db, 100, 1);
			strictEqual(counts.length, 2);
			strictEqual(counts[0]?.emoji, '👍');
			strictEqual(counts[0]?.count, 5);
			strictEqual(counts[1]?.emoji, '❤️');
			strictEqual(counts[1]?.count, 3);
		});

		it('replaces previous counts — second call with different counts, old counts gone', () => {
			applyReactionCounts(db, 100, 1, [{ emoji: '👍', emojiType: 'emoji', count: 5 }], 1000);

			applyReactionCounts(db, 100, 1, [{ emoji: '🔥', emojiType: 'emoji', count: 10 }], 2000);

			const counts = getReactionCounts(db, 100, 1);
			strictEqual(counts.length, 1);
			strictEqual(counts[0]?.emoji, '🔥');
			strictEqual(counts[0]?.count, 10);
		});
	});

	describe('getReactions', () => {
		it('returns empty array for unknown message', () => {
			deepStrictEqual(getReactions(db, 999, 999), []);
		});
	});

	describe('getReactionCounts', () => {
		it('returns empty array for unknown message', () => {
			deepStrictEqual(getReactionCounts(db, 999, 999), []);
		});
	});

	describe('userReactions', () => {
		beforeEach(() => {
			applyReactionUpdate(db, 100, 1, 42, 'Alice', [], ['👍'], 1000);
			applyReactionUpdate(db, 100, 2, 42, 'Alice', [], ['❤️'], 1000);
			applyReactionUpdate(db, 200, 3, 42, 'Alice', [], ['🔥'], 1000);
			applyReactionUpdate(db, 100, 1, 99, 'Bob', [], ['👍'], 1000);
		});

		it('returns reactions for a user across all chats', () => {
			const results = userReactions(db, 42);
			strictEqual(results.length, 3);
			strictEqual(
				results.every((r) => r.emojiType === 'emoji'),
				true,
			);
		});

		it('with chatId filter — only returns reactions from that chat', () => {
			const results = userReactions(db, 42, { chatId: 100 });
			strictEqual(results.length, 2);
			strictEqual(
				results.every((r) => r.chatId === 100),
				true,
			);
		});

		it('with limit — respects limit option', () => {
			const results = userReactions(db, 42, { limit: 1 });
			strictEqual(results.length, 1);
		});
	});
});
