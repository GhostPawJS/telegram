import type { TelegramDb } from '../database.ts';
import { mapChatRow } from './map_chat_row.ts';
import type { Chat, ChatRow } from './types.ts';

export function getChat(db: TelegramDb, chatId: number): Chat | null {
	const row = db.prepare('SELECT * FROM chats WHERE chat_id = ?').get<ChatRow>(chatId);
	return row ? mapChatRow(row) : null;
}
