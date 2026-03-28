import type { TelegramDb } from '../database.ts';
import { mapFileRow } from './map_file_row.ts';
import type { FileEntry, FileQuery, FileRow } from './types.ts';

export function listFiles(db: TelegramDb, query: FileQuery = {}): FileEntry[] {
	const conditions: string[] = [];
	const params: unknown[] = [];

	if (query.chatId !== undefined) {
		conditions.push('chat_id = ?');
		params.push(query.chatId);
	}
	if (query.messageId !== undefined) {
		conditions.push('message_id = ?');
		params.push(query.messageId);
	}
	if (query.type !== undefined) {
		conditions.push('type = ?');
		params.push(query.type);
	}
	if (query.hasBlob === true) {
		conditions.push('checksum IS NOT NULL');
	} else if (query.hasBlob === false) {
		conditions.push('checksum IS NULL');
	}

	const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
	const limitClause = query.limit !== undefined ? `LIMIT ${query.limit}` : '';

	const rows = db
		.prepare(`SELECT * FROM files ${where} ORDER BY created_at DESC ${limitClause}`)
		.all<FileRow>(...params);

	return rows.map(mapFileRow);
}
