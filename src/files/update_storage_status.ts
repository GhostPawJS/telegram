import type { TelegramDb } from '../database.ts';
import { TelegramNotFoundError, TelegramStateError } from '../errors.ts';
import { resolveNow } from '../resolve_now.ts';
import { getFile } from './get_file.ts';
import type { FileEntry, StorageStatus } from './types.ts';

export function updateStorageStatus(
	db: TelegramDb,
	fileId: string,
	status: StorageStatus,
	localPath?: string | null,
	localHash?: string | null,
	now?: number,
): FileEntry {
	const ts = resolveNow(now);
	const downloadedAt = status === 'downloaded' ? ts : null;

	const result = db
		.prepare(
			`UPDATE files
       SET storage_status = ?,
           local_path     = ?,
           local_hash     = ?,
           downloaded_at  = ?,
           updated_at     = ?
       WHERE file_id = ?`,
		)
		.run(status, localPath ?? null, localHash ?? null, downloadedAt, ts, fileId);

	if (!result.changes || result.changes === 0) {
		throw new TelegramNotFoundError(`File not found: ${fileId}`);
	}

	const entry = getFile(db, fileId);
	if (!entry) throw new TelegramStateError('file row missing after update');
	return entry;
}
