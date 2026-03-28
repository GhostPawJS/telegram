import { createHash } from 'node:crypto';
import type { TelegramDb } from '../database.ts';
import { TelegramNotFoundError, TelegramStateError } from '../errors.ts';
import { resolveNow } from '../resolve_now.ts';
import { getFile } from './get_file.ts';
import type { FileEntry } from './types.ts';

/**
 * Store raw file bytes in SQLite and link them to a file_id.
 * Deduplicates by SHA-256: if the same bytes were already stored,
 * the existing blob row is reused and only the files record is updated.
 * Returns the updated FileEntry with checksum set.
 */
export function storeFileBlob(
	db: TelegramDb,
	fileId: string,
	data: Buffer,
	now?: number,
): FileEntry {
	const ts = resolveNow(now);
	const checksum = createHash('sha256').update(data).digest('hex');

	db.prepare(
		`INSERT INTO file_blobs (checksum, data, byte_size, created_at)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(checksum) DO NOTHING`,
	).run(checksum, data, data.byteLength, ts);

	const result = db
		.prepare(`UPDATE files SET checksum = ?, updated_at = ? WHERE file_id = ?`)
		.run(checksum, ts, fileId);

	if (!result.changes || result.changes === 0) {
		throw new TelegramNotFoundError(`File not found: ${fileId}`);
	}

	const entry = getFile(db, fileId);
	if (!entry) throw new TelegramStateError('file row missing after blob store');
	return entry;
}
