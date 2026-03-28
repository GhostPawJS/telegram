import type { TelegramDb } from '../database.ts';
import type { UserMessageStub } from './types.ts';

interface UserMessageRow {
	chat_id: number;
	message_id: number;
	date: number;
	text: string | null;
	type: string;
}

export function userMessages(
	db: TelegramDb,
	userId: number,
	opts: { limit?: number; chatId?: number } = {},
): UserMessageStub[] {
	const conditions = ['from_user_id = ?'];
	const params: unknown[] = [userId];

	if (opts.chatId !== undefined) {
		conditions.push('chat_id = ?');
		params.push(opts.chatId);
	}

	const limit = opts.limit ?? 50;
	const rows = db
		.prepare(
			`SELECT chat_id, message_id, date, text, type FROM messages WHERE ${conditions.join(' AND ')} ORDER BY date DESC LIMIT ?`,
		)
		.all<UserMessageRow>(...params, limit);

	return rows.map((r) => ({
		chatId: r.chat_id,
		messageId: r.message_id,
		date: r.date,
		text: r.text,
		type: r.type,
	}));
}
