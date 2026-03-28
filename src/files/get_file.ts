import type { TelegramDb } from '../database.ts';
import { mapFileRow } from './map_file_row.ts';
import type { FileEntry, FileRow } from './types.ts';

export function getFile(db: TelegramDb, fileId: string): FileEntry | null {
	const row = db.prepare('SELECT * FROM files WHERE file_id = ?').get<FileRow>(fileId);
	return row ? mapFileRow(row) : null;
}
