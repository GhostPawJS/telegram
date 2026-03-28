import type { TelegramDb } from '../database.ts';
import { mapChatRow } from './map_chat_row.ts';
import type { Chat, ChatFilter, ChatRow } from './types.ts';

export function listChats(db: TelegramDb, filter: ChatFilter = {}): Chat[] {
	const conditions: string[] = [];
	const params: unknown[] = [];

	if (filter.type !== undefined) {
		conditions.push('type = ?');
		params.push(filter.type);
	}

	if (filter.isActive !== undefined) {
		conditions.push('is_active = ?');
		params.push(filter.isActive ? 1 : 0);
	}

	if (filter.isForum !== undefined) {
		conditions.push('is_forum = ?');
		params.push(filter.isForum ? 1 : 0);
	}

	const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
	const limit = filter.limit !== undefined ? `LIMIT ?` : '';
	const offset = filter.offset !== undefined ? `OFFSET ?` : '';

	if (filter.limit !== undefined) params.push(filter.limit);
	if (filter.offset !== undefined) params.push(filter.offset);

	const sql = [
		'SELECT * FROM chats',
		where,
		'ORDER BY last_message_at DESC NULLS LAST',
		limit,
		offset,
	]
		.filter(Boolean)
		.join(' ');

	const rows = db.prepare(sql).all<ChatRow>(...params);
	return rows.map(mapChatRow);
}
