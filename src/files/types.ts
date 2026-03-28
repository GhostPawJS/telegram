export type FileType =
	| 'photo'
	| 'document'
	| 'voice'
	| 'video'
	| 'audio'
	| 'sticker'
	| 'animation'
	| 'video_note'
	| 'thumbnail'
	| 'other';

export interface FileRow {
	file_id: string;
	file_unique_id: string;
	chat_id: number | null;
	message_id: number | null;
	type: string;
	mime_type: string | null;
	file_name: string | null;
	file_size: number | null;
	width: number | null;
	height: number | null;
	duration: number | null;
	checksum: string | null;
	created_at: number;
	updated_at: number;
}

export interface FileEntry {
	fileId: string;
	fileUniqueId: string;
	chatId: number | null;
	messageId: number | null;
	type: FileType;
	mimeType: string | null;
	fileName: string | null;
	fileSize: number | null;
	width: number | null;
	height: number | null;
	duration: number | null;
	/** SHA-256 hex of the file content. null = not yet downloaded. */
	checksum: string | null;
	createdAt: number;
	updatedAt: number;
}

export interface FileQuery {
	chatId?: number;
	messageId?: number;
	type?: FileType;
	/** Filter to only entries that have (or have not) been downloaded. */
	hasBlob?: boolean;
	limit?: number;
}

export type FileInput = Omit<FileEntry, 'createdAt' | 'updatedAt'>;
