import { ok, strictEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { Message } from 'grammy/types';
import { extractDownloadableFiles } from './extract_downloadable_files.ts';

// Minimal grammy Message stub
function base(): Partial<Message> {
	return { chat: { id: 1, type: 'private', first_name: 'Test' }, message_id: 1, date: 0 };
}

describe('extractDownloadableFiles', () => {
	it('returns empty array for text-only message', () => {
		const result = extractDownloadableFiles({ ...base(), text: 'hello' } as Message);
		strictEqual(result.length, 0);
	});

	it('returns empty array for location (no file_id)', () => {
		const result = extractDownloadableFiles({
			...base(),
			location: { latitude: 1, longitude: 2 },
		} as Message);
		strictEqual(result.length, 0);
	});

	it('photo: returns only the largest size', () => {
		const msg = {
			...base(),
			photo: [
				{ file_id: 'small', file_unique_id: 'us', width: 90, height: 90, file_size: 100 },
				{ file_id: 'large', file_unique_id: 'ul', width: 800, height: 600, file_size: 5000 },
			],
		} as Message;
		const files = extractDownloadableFiles(msg);
		strictEqual(files.length, 1);
		strictEqual(files[0]?.fileId, 'large');
		strictEqual(files[0]?.type, 'photo');
		strictEqual(files[0]?.width, 800);
		strictEqual(files[0]?.height, 600);
		strictEqual(files[0]?.fileSize, 5000);
	});

	it('document: returns document + thumbnail', () => {
		const msg = {
			...base(),
			document: {
				file_id: 'doc1',
				file_unique_id: 'ud1',
				file_name: 'report.pdf',
				mime_type: 'application/pdf',
				file_size: 12000,
				thumbnail: {
					file_id: 'thumb1',
					file_unique_id: 'ut1',
					width: 90,
					height: 90,
					file_size: 200,
				},
			},
		} as Message;
		const files = extractDownloadableFiles(msg);
		strictEqual(files.length, 2);
		const doc = files.find((f) => f.type === 'document');
		const thumb = files.find((f) => f.type === 'photo');
		ok(doc !== undefined);
		ok(thumb !== undefined);
		strictEqual(doc.fileId, 'doc1');
		strictEqual(doc.fileName, 'report.pdf');
		strictEqual(doc.mimeType, 'application/pdf');
		strictEqual(thumb.fileId, 'thumb1');
	});

	it('document without thumbnail: returns one entry', () => {
		const msg = {
			...base(),
			document: { file_id: 'doc2', file_unique_id: 'ud2', file_size: 500 },
		} as Message;
		const files = extractDownloadableFiles(msg);
		strictEqual(files.length, 1);
		strictEqual(files[0]?.type, 'document');
	});

	it('voice: returns voice entry with duration', () => {
		const msg = {
			...base(),
			voice: {
				file_id: 'v1',
				file_unique_id: 'uv1',
				duration: 30,
				mime_type: 'audio/ogg',
				file_size: 8000,
			},
		} as Message;
		const files = extractDownloadableFiles(msg);
		strictEqual(files.length, 1);
		strictEqual(files[0]?.type, 'voice');
		strictEqual(files[0]?.duration, 30);
	});

	it('video: returns video + thumbnail', () => {
		const msg = {
			...base(),
			video: {
				file_id: 'vid1',
				file_unique_id: 'uvid1',
				width: 1920,
				height: 1080,
				duration: 120,
				mime_type: 'video/mp4',
				file_size: 50000,
				thumbnail: {
					file_id: 'vthumb',
					file_unique_id: 'uvt',
					width: 320,
					height: 180,
					file_size: 1000,
				},
			},
		} as Message;
		const files = extractDownloadableFiles(msg);
		strictEqual(files.length, 2);
		const vid = files.find((f) => f.type === 'video');
		ok(vid !== undefined);
		strictEqual(vid.duration, 120);
		strictEqual(vid.width, 1920);
	});

	it('sticker: returns sticker + thumbnail', () => {
		const msg = {
			...base(),
			sticker: {
				file_id: 's1',
				file_unique_id: 'us1',
				width: 512,
				height: 512,
				is_animated: false,
				is_video: false,
				type: 'regular',
				thumbnail: { file_id: 'st', file_unique_id: 'ust', width: 90, height: 90, file_size: 200 },
			},
		} as Message;
		const files = extractDownloadableFiles(msg);
		strictEqual(files.length, 2);
		strictEqual(files.find((f) => f.type === 'sticker')?.fileId, 's1');
	});

	it('video_note: uses length for both width and height', () => {
		const msg = {
			...base(),
			video_note: {
				file_id: 'vn1',
				file_unique_id: 'uvn1',
				length: 240,
				duration: 10,
				file_size: 3000,
			},
		} as Message;
		const files = extractDownloadableFiles(msg);
		strictEqual(files.length, 1);
		strictEqual(files[0]?.type, 'video_note');
		strictEqual(files[0]?.width, 240);
		strictEqual(files[0]?.height, 240);
	});
});
