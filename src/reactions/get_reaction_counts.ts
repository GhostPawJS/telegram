import type { TelegramDb } from '../database.ts';
import type { EmojiType, ReactionCount, ReactionCountRow } from './types.ts';

export function getReactionCounts(
	db: TelegramDb,
	chatId: number,
	messageId: number,
): ReactionCount[] {
	const rows = db
		.prepare('SELECT * FROM reaction_counts WHERE chat_id=? AND message_id=? ORDER BY count DESC')
		.all<ReactionCountRow>(chatId, messageId);

	return rows.map((row) => ({
		emoji: row.emoji,
		emojiType: row.emoji_type as EmojiType,
		count: row.count,
		updatedAt: row.updated_at,
	}));
}
