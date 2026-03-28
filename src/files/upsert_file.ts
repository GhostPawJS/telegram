import type { TelegramDb } from '../database.ts';
import { TelegramStateError } from '../errors.ts';
import { resolveNow } from '../resolve_now.ts';
import { getFile } from './get_file.ts';
import type { FileEntry, FileInput } from './types.ts';

export function upsertFile(db: TelegramDb, data: FileInput, now?: number): FileEntry {
	const ts = resolveNow(now);

	db.prepare(
		`INSERT INTO files (
      file_id, file_unique_id, chat_id, message_id, type, mime_type, file_name,
      file_size, width, height, duration, checksum, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(file_id) DO UPDATE SET
      file_unique_id = excluded.file_unique_id,
      chat_id        = excluded.chat_id,
      message_id     = excluded.message_id,
      type           = excluded.type,
      mime_type      = excluded.mime_type,
      file_name      = excluded.file_name,
      file_size      = excluded.file_size,
      width          = excluded.width,
      height         = excluded.height,
      duration       = excluded.duration,
      updated_at     = excluded.updated_at`,
	).run(
		data.fileId,
		data.fileUniqueId,
		data.chatId ?? null,
		data.messageId ?? null,
		data.type,
		data.mimeType ?? null,
		data.fileName ?? null,
		data.fileSize ?? null,
		data.width ?? null,
		data.height ?? null,
		data.duration ?? null,
		data.checksum ?? null,
		ts,
		ts,
	);

	const entry = getFile(db, data.fileId);
	if (!entry) throw new TelegramStateError('file row missing after upsert');
	return entry;
}
