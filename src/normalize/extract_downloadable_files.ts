import type { Message } from 'grammy/types';
import type { FileInput, FileType } from '../files/types.ts';

type FileBase = Omit<FileInput, 'chatId' | 'messageId' | 'checksum'>;

function photo(
	fileId: string,
	fileUniqueId: string,
	fileSize: number | undefined,
	width: number,
	height: number,
): FileBase {
	return {
		fileId,
		fileUniqueId,
		type: 'photo',
		mimeType: 'image/jpeg',
		fileName: null,
		fileSize: fileSize ?? null,
		width,
		height,
		duration: null,
	};
}

/**
 * Extract all downloadable files from a grammy Message.
 * Returns partial FileInput values — caller must add chatId, messageId, checksum.
 * Only includes media types that have a file_id (skips location, venue, contact, etc.).
 */
export function extractDownloadableFiles(msg: Message): FileBase[] {
	const files: FileBase[] = [];

	if (msg.photo && msg.photo.length > 0) {
		// Store only the largest resolution — thumbnails are subsets of its pixels
		const largest = msg.photo[msg.photo.length - 1];
		if (largest)
			files.push(
				photo(
					largest.file_id,
					largest.file_unique_id,
					largest.file_size,
					largest.width,
					largest.height,
				),
			);
	}

	if (msg.document) {
		const d = msg.document;
		files.push({
			fileId: d.file_id,
			fileUniqueId: d.file_unique_id,
			type: 'document',
			mimeType: d.mime_type ?? null,
			fileName: d.file_name ?? null,
			fileSize: d.file_size ?? null,
			width: null,
			height: null,
			duration: null,
		});
		if (d.thumbnail)
			files.push(
				photo(
					d.thumbnail.file_id,
					d.thumbnail.file_unique_id,
					d.thumbnail.file_size,
					d.thumbnail.width,
					d.thumbnail.height,
				),
			);
	}

	if (msg.voice) {
		const v = msg.voice;
		files.push({
			fileId: v.file_id,
			fileUniqueId: v.file_unique_id,
			type: 'voice',
			mimeType: v.mime_type ?? null,
			fileName: null,
			fileSize: v.file_size ?? null,
			width: null,
			height: null,
			duration: v.duration,
		});
	}

	if (msg.video) {
		const v = msg.video;
		files.push({
			fileId: v.file_id,
			fileUniqueId: v.file_unique_id,
			type: 'video',
			mimeType: v.mime_type ?? null,
			fileName: v.file_name ?? null,
			fileSize: v.file_size ?? null,
			width: v.width,
			height: v.height,
			duration: v.duration,
		});
		if (v.thumbnail)
			files.push(
				photo(
					v.thumbnail.file_id,
					v.thumbnail.file_unique_id,
					v.thumbnail.file_size,
					v.thumbnail.width,
					v.thumbnail.height,
				),
			);
	}

	if (msg.audio) {
		const a = msg.audio;
		files.push({
			fileId: a.file_id,
			fileUniqueId: a.file_unique_id,
			type: 'audio',
			mimeType: a.mime_type ?? null,
			fileName: a.file_name ?? null,
			fileSize: a.file_size ?? null,
			width: null,
			height: null,
			duration: a.duration,
		});
		if (a.thumbnail)
			files.push(
				photo(
					a.thumbnail.file_id,
					a.thumbnail.file_unique_id,
					a.thumbnail.file_size,
					a.thumbnail.width,
					a.thumbnail.height,
				),
			);
	}

	if (msg.animation) {
		const a = msg.animation;
		files.push({
			fileId: a.file_id,
			fileUniqueId: a.file_unique_id,
			type: 'animation',
			mimeType: a.mime_type ?? null,
			fileName: a.file_name ?? null,
			fileSize: a.file_size ?? null,
			width: a.width,
			height: a.height,
			duration: a.duration,
		});
		if (a.thumbnail)
			files.push(
				photo(
					a.thumbnail.file_id,
					a.thumbnail.file_unique_id,
					a.thumbnail.file_size,
					a.thumbnail.width,
					a.thumbnail.height,
				),
			);
	}

	if (msg.sticker) {
		const s = msg.sticker;
		files.push({
			fileId: s.file_id,
			fileUniqueId: s.file_unique_id,
			type: 'sticker',
			mimeType: null,
			fileName: null,
			fileSize: s.file_size ?? null,
			width: s.width,
			height: s.height,
			duration: null,
		});
		if (s.thumbnail)
			files.push(
				photo(
					s.thumbnail.file_id,
					s.thumbnail.file_unique_id,
					s.thumbnail.file_size,
					s.thumbnail.width,
					s.thumbnail.height,
				),
			);
	}

	if (msg.video_note) {
		const v = msg.video_note;
		files.push({
			fileId: v.file_id,
			fileUniqueId: v.file_unique_id,
			type: 'video_note',
			mimeType: null,
			fileName: null,
			fileSize: v.file_size ?? null,
			width: v.length,
			height: v.length,
			duration: v.duration,
		});
		if (v.thumbnail)
			files.push(
				photo(
					v.thumbnail.file_id,
					v.thumbnail.file_unique_id,
					v.thumbnail.file_size,
					v.thumbnail.width,
					v.thumbnail.height,
				),
			);
	}

	return files;
}

export type { FileType };
