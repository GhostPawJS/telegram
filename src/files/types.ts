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
export type StorageStatus = 'remote_only' | 'downloaded' | 'failed';

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
	local_path: string | null;
	local_hash: string | null;
	storage_status: string;
	downloaded_at: number | null;
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
	localPath: string | null;
	localHash: string | null;
	storageStatus: StorageStatus;
	downloadedAt: number | null;
	createdAt: number;
	updatedAt: number;
}

export interface FileQuery {
	chatId?: number;
	messageId?: number;
	type?: FileType;
	storageStatus?: StorageStatus;
	limit?: number;
}

export type FileInput = Omit<FileEntry, 'createdAt' | 'updatedAt'>;
