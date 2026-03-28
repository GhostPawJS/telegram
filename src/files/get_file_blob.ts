import type { TelegramDb } from '../database.ts';

interface BlobRow {
	data: Uint8Array;
}

/**
 * Retrieve the raw bytes for a file by file_id.
 * Returns null if the file has not been downloaded yet (checksum is null).
 */
export function getFileBlob(db: TelegramDb, fileId: string): Buffer | null {
	const row = db
		.prepare(
			`SELECT fb.data FROM file_blobs fb
       JOIN files f ON f.checksum = fb.checksum
       WHERE f.file_id = ?`,
		)
		.get<BlobRow>(fileId);
	return row ? Buffer.from(row.data) : null;
}
