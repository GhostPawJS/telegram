import type { TelegramDb } from '../database.ts';
import type { MessageEdit, MessageEditRow } from './types.ts';

function mapEditRow(row: MessageEditRow): MessageEdit {
	return {
		id: row.id,
		chatId: row.chat_id,
		messageId: row.message_id,
		text: row.text,
		entities: row.entities !== null ? (JSON.parse(row.entities) as unknown[]) : null,
		media: row.media !== null ? (JSON.parse(row.media) as Record<string, unknown>) : null,
		editDate: row.edit_date,
		capturedAt: row.captured_at,
	};
}

export function editHistory(db: TelegramDb, chatId: number, messageId: number): MessageEdit[] {
	const rows = db
		.prepare(
			'SELECT * FROM message_edits WHERE chat_id = ? AND message_id = ? ORDER BY captured_at ASC',
		)
		.all<MessageEditRow>(chatId, messageId);

	return rows.map(mapEditRow);
}
