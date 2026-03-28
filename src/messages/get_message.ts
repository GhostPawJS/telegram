import type { TelegramDb } from '../database.ts';
import { mapMessageRow } from './map_message_row.ts';
import type { MessageRow, StoredMessage } from './types.ts';

export function getMessage(
	db: TelegramDb,
	chatId: number,
	messageId: number,
): StoredMessage | null {
	const row = db
		.prepare('SELECT * FROM messages WHERE chat_id = ? AND message_id = ?')
		.get<MessageRow>(chatId, messageId);
	return row ? mapMessageRow(row) : null;
}
