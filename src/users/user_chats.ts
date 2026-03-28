import type { TelegramDb } from '../database.ts';
import type { UserChatStub } from './types.ts';

interface UserChatRow {
	chat_id: number;
	type: string;
	title: string | null;
	username: string | null;
	is_active: number;
}

export function userChats(db: TelegramDb, userId: number): UserChatStub[] {
	const rows = db
		.prepare(
			`SELECT c.chat_id, c.type, c.title, c.username, c.is_active
       FROM chats c
       JOIN members m ON m.chat_id = c.chat_id
       WHERE m.user_id = ?
       ORDER BY c.last_message_at DESC NULLS LAST`,
		)
		.all<UserChatRow>(userId);

	return rows.map((r) => ({
		chatId: r.chat_id,
		type: r.type,
		title: r.title,
		username: r.username,
		isActive: r.is_active === 1,
	}));
}
