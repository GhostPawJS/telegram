import type { TelegramDb } from '../database.ts';
import { mapMessageRow } from './map_message_row.ts';
import type { MessageQuery, MessageRow, StoredMessage } from './types.ts';

export function listMessages(db: TelegramDb, query: MessageQuery): StoredMessage[] {
	const conditions: string[] = ['chat_id = ?'];
	const params: unknown[] = [query.chatId];

	if (!query.includeDeleted) {
		conditions.push('is_deleted = 0');
	}

	if (query.direction !== undefined) {
		conditions.push('direction = ?');
		params.push(query.direction);
	}

	if (query.type !== undefined) {
		conditions.push('type = ?');
		params.push(query.type);
	}

	if (query.threadId !== undefined) {
		conditions.push('thread_id = ?');
		params.push(query.threadId);
	}

	if (query.before !== undefined) {
		conditions.push('date < ?');
		params.push(query.before);
	}

	if (query.after !== undefined) {
		conditions.push('date > ?');
		params.push(query.after);
	}

	const where = `WHERE ${conditions.join(' AND ')}`;
	const limit = query.limit ?? 50;
	const offset = query.offset ?? 0;

	const rows = db
		.prepare(`SELECT * FROM messages ${where} ORDER BY date DESC LIMIT ? OFFSET ?`)
		.all<MessageRow>(...params, limit, offset);

	return rows.map(mapMessageRow);
}
