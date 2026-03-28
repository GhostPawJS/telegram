import * as https from 'node:https';
import type { TelegramDb } from '../database.ts';
import { storeFileBlob } from '../files/store_file_blob.ts';
import type { FileEntry } from '../files/types.ts';
import type { MockBot } from '../lib/mock_grammy.ts';

type Fetcher = (url: string) => Promise<Buffer>;

/**
 * Download a Telegram file by file_id into SQLite as a BLOB.
 * Deduplicates by SHA-256 — identical bytes are stored only once.
 * Returns the updated FileEntry with checksum set.
 *
 * The file must already exist in the files table (upsertFile must have
 * been called first, typically during message normalization).
 */
export async function downloadFile(
	bot: MockBot,
	db: TelegramDb,
	fileId: string,
	_fetcher?: Fetcher,
): Promise<FileEntry> {
	const fetcher = _fetcher ?? fetchBuffer;
	const fileInfo = (await bot.call('getFile', { file_id: fileId })) as { file_path: string };
	const url = `https://api.telegram.org/file/bot${bot.token}/${fileInfo.file_path}`;
	const data = await fetcher(url);
	return storeFileBlob(db, fileId, data);
}

function fetchBuffer(url: string): Promise<Buffer> {
	return new Promise((resolve, reject) => {
		https
			.get(url, (res) => {
				const chunks: Buffer[] = [];
				res.on('data', (chunk: Buffer) => chunks.push(chunk));
				res.on('end', () => resolve(Buffer.concat(chunks)));
				res.on('error', reject);
			})
			.on('error', reject);
	});
}
