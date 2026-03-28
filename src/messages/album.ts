import type { TelegramDb } from '../database.ts';
import { mapMessageRow } from './map_message_row.ts';
import type { MessageRow, StoredMessage } from './types.ts';

export function album(db: TelegramDb, chatId: number, mediaGroupId: string): StoredMessage[] {
	const rows = db
		.prepare('SELECT * FROM messages WHERE chat_id = ? AND media_group_id = ? ORDER BY date ASC')
		.all<MessageRow>(chatId, mediaGroupId);

	return rows.map(mapMessageRow);
}
