import type { TelegramDb } from '../database.ts';
import { mapCallbackRow } from './map_callback_row.ts';
import type { CallbackEntry, CallbackRow } from './types.ts';

export function getCallbacks(db: TelegramDb, chatId: number, messageId: number): CallbackEntry[] {
	const rows = db
		.prepare('SELECT * FROM callbacks WHERE chat_id = ? AND message_id = ? ORDER BY created_at ASC')
		.all<CallbackRow>(chatId, messageId);
	return rows.map(mapCallbackRow);
}
