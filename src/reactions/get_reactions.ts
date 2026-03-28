import type { TelegramDb } from '../database.ts';
import type { EmojiType, ReactionRow, UserReaction } from './types.ts';

export function getReactions(db: TelegramDb, chatId: number, messageId: number): UserReaction[] {
	const rows = db
		.prepare('SELECT * FROM reactions WHERE chat_id=? AND message_id=?')
		.all<ReactionRow>(chatId, messageId);

	return rows.map((row) => ({
		userId: row.user_id,
		displayName: row.display_name,
		emoji: row.emoji,
		emojiType: row.emoji_type as EmojiType,
		setAt: row.set_at,
	}));
}
