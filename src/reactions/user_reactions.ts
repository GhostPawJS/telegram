import type { TelegramDb } from '../database.ts';
import type { EmojiType, ReactionRow, UserReactionSummary } from './types.ts';

export function userReactions(
	db: TelegramDb,
	userId: number,
	opts?: { limit?: number; chatId?: number },
): UserReactionSummary[] {
	let sql = 'SELECT * FROM reactions WHERE user_id=?';
	const params: unknown[] = [userId];

	if (opts?.chatId !== undefined) {
		sql += ' AND chat_id=?';
		params.push(opts.chatId);
	}

	if (opts?.limit !== undefined) {
		sql += ' LIMIT ?';
		params.push(opts.limit);
	}

	const rows = db.prepare(sql).all<ReactionRow>(...params);

	return rows.map((row) => ({
		chatId: row.chat_id,
		messageId: row.message_id,
		emoji: row.emoji,
		emojiType: row.emoji_type as EmojiType,
		setAt: row.set_at,
	}));
}
