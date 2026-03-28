import type { FileEntry, FileRow, FileType } from './types.ts';

export function mapFileRow(row: FileRow): FileEntry {
	return {
		fileId: row.file_id,
		fileUniqueId: row.file_unique_id,
		chatId: row.chat_id,
		messageId: row.message_id,
		type: row.type as FileType,
		mimeType: row.mime_type,
		fileName: row.file_name,
		fileSize: row.file_size,
		width: row.width,
		height: row.height,
		duration: row.duration,
		checksum: row.checksum,
		createdAt: row.created_at,
		updatedAt: row.updated_at,
	};
}
