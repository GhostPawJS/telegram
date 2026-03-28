import type { TelegramDb } from '../database.ts';
import { resolveNow } from '../resolve_now.ts';
import { withTransaction } from '../with_transaction.ts';
import { normalizeReactionInput } from './normalize_reaction_input.ts';
import type { ReactionInput } from './types.ts';

export function applyReactionUpdate(
	db: TelegramDb,
	chatId: number,
	messageId: number,
	userId: number,
	displayName: string,
	oldReactions: ReactionInput[],
	newReactions: ReactionInput[],
	now?: number,
): void {
	const ts = resolveNow(now);

	withTransaction(db, () => {
		// 1. Delete existing per-user rows
		db.prepare('DELETE FROM reactions WHERE chat_id=? AND message_id=? AND user_id=?').run(
			chatId,
			messageId,
			userId,
		);

		// 2. Insert new rows
		const insertStmt = db.prepare(
			'INSERT INTO reactions (chat_id, message_id, user_id, display_name, emoji, emoji_type, set_at) VALUES (?,?,?,?,?,?,?)',
		);
		for (const r of newReactions) {
			const { emoji, emojiType } = normalizeReactionInput(r);
			insertStmt.run(chatId, messageId, userId, displayName, emoji, emojiType, ts);
		}

		// 3. Compute diff
		const oldNormalized = new Map(
			oldReactions.map((r) => {
				const n = normalizeReactionInput(r);
				return [n.emoji, n];
			}),
		);
		const newNormalized = new Map(
			newReactions.map((r) => {
				const n = normalizeReactionInput(r);
				return [n.emoji, n];
			}),
		);

		const eventStmt = db.prepare(
			'INSERT INTO reaction_events (chat_id, message_id, user_id, emoji, emoji_type, action, event_at) VALUES (?,?,?,?,?,?,?)',
		);

		// removed = in old but not in new
		for (const [emoji, { emojiType }] of oldNormalized) {
			if (!newNormalized.has(emoji)) {
				eventStmt.run(chatId, messageId, userId, emoji, emojiType, 'remove', ts);
			}
		}

		// added = in new but not in old
		for (const [emoji, { emojiType }] of newNormalized) {
			if (!oldNormalized.has(emoji)) {
				eventStmt.run(chatId, messageId, userId, emoji, emojiType, 'add', ts);
			}
		}
	});
}
