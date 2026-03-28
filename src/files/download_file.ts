import type { TelegramDb } from '../database.ts';
import { TelegramStateError } from '../errors.ts';
import type { FileEntry } from './types.ts';

export async function downloadFile(
	_db: TelegramDb,
	_bot: unknown,
	_fileId: string,
	_destPath: string,
	_now?: number,
): Promise<FileEntry> {
	throw new TelegramStateError('not yet implemented');
}
