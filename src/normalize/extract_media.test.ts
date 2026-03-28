import { deepStrictEqual, strictEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { Message } from 'grammy/types';

import { extractMedia } from './extract_media.ts';

const base: Message = {
	message_id: 1,
	date: 1000000,
	chat: { id: 1, type: 'private', first_name: 'A' },
} as unknown as Message;

describe('extractMedia', () => {
	it('returns hasMedia=false and media=null for text message', () => {
		const result = extractMedia({ ...base, text: 'hello' } as Message);
		strictEqual(result.hasMedia, false);
		strictEqual(result.media, null);
	});

	it('returns hasMedia=true for photo and picks the largest size', () => {
		const small = {
			file_id: 'small',
			file_unique_id: 's',
			width: 100,
			height: 100,
			file_size: 1000,
		};
		const large = {
			file_id: 'large',
			file_unique_id: 'l',
			width: 800,
			height: 600,
			file_size: 50000,
		};
		const msg = { ...base, photo: [small, large] } as unknown as Message;
		const result = extractMedia(msg);
		strictEqual(result.hasMedia, true);
		deepStrictEqual(result.media, large);
	});

	it('returns hasMedia=true for document', () => {
		const doc = { file_id: 'doc1', file_unique_id: 'd1', mime_type: 'application/pdf' };
		const result = extractMedia({ ...base, document: doc } as Message);
		strictEqual(result.hasMedia, true);
		deepStrictEqual(result.media, doc);
	});

	it('returns hasMedia=true for voice', () => {
		const voice = { file_id: 'v1', file_unique_id: 'v1', duration: 10, mime_type: 'audio/ogg' };
		const result = extractMedia({ ...base, voice } as Message);
		strictEqual(result.hasMedia, true);
	});

	it('returns hasMedia=true for video', () => {
		const video = {
			file_id: 'vid1',
			file_unique_id: 'vid1',
			width: 1280,
			height: 720,
			duration: 30,
		};
		const result = extractMedia({ ...base, video } as Message);
		strictEqual(result.hasMedia, true);
	});

	it('returns hasMedia=true for location', () => {
		const result = extractMedia({
			...base,
			location: { latitude: 51.5, longitude: -0.1 },
		} as Message);
		strictEqual(result.hasMedia, true);
	});
});
