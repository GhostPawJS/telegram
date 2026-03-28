import type { TelegramDb } from '../database.ts';
import { resolveNow } from '../resolve_now.ts';
import { withTransaction } from '../with_transaction.ts';
import type { EmojiType } from './types.ts';

export function applyReactionCounts(
	db: TelegramDb,
	chatId: number,
	messageId: number,
	counts: { emoji: string; emojiType: EmojiType; count: number }[],
	now?: number,
): void {
	const ts = resolveNow(now);

	withTransaction(db, () => {
		// 1. Delete existing counts for this message
		db.prepare('DELETE FROM reaction_counts WHERE chat_id=? AND message_id=?').run(
			chatId,
			messageId,
		);

		// 2. Insert new count rows
		const insertStmt = db.prepare(
			'INSERT INTO reaction_counts (chat_id, message_id, emoji, emoji_type, count, updated_at) VALUES (?,?,?,?,?,?)',
		);
		for (const { emoji, emojiType, count } of counts) {
			insertStmt.run(chatId, messageId, emoji, emojiType, count, ts);
		}
	});
}
