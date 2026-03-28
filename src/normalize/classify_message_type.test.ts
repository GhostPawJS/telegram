import { strictEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { Message } from 'grammy/types';

import { classifyMessageType } from './classify_message_type.ts';

const base: Message = {
	message_id: 1,
	date: 1000000,
	chat: { id: 1, type: 'private', first_name: 'A' },
} as unknown as Message;

describe('classifyMessageType', () => {
	it('returns text for text messages', () => {
		strictEqual(classifyMessageType({ ...base, text: 'hello' } as Message), 'text');
	});

	it('returns photo for photo messages', () => {
		strictEqual(
			classifyMessageType({
				...base,
				photo: [{ file_id: 'x', file_unique_id: 'x', width: 100, height: 100, file_size: 1000 }],
			} as Message),
			'photo',
		);
	});

	it('returns document for document messages', () => {
		strictEqual(
			classifyMessageType({ ...base, document: { file_id: 'x', file_unique_id: 'x' } } as Message),
			'document',
		);
	});

	it('returns voice for voice messages', () => {
		strictEqual(
			classifyMessageType({
				...base,
				voice: { file_id: 'x', file_unique_id: 'x', duration: 5, mime_type: 'audio/ogg' },
			} as Message),
			'voice',
		);
	});

	it('returns video for video messages', () => {
		strictEqual(
			classifyMessageType({
				...base,
				video: { file_id: 'x', file_unique_id: 'x', width: 100, height: 100, duration: 5 },
			} as Message),
			'video',
		);
	});

	it('returns video_note for video note messages', () => {
		strictEqual(
			classifyMessageType({
				...base,
				video_note: { file_id: 'x', file_unique_id: 'x', length: 100, duration: 5 },
			} as Message),
			'video_note',
		);
	});

	it('returns sticker for sticker messages', () => {
		strictEqual(
			classifyMessageType({
				...base,
				sticker: {
					file_id: 'x',
					file_unique_id: 'x',
					type: 'regular',
					width: 512,
					height: 512,
					is_animated: false,
					is_video: false,
				},
			} as Message),
			'sticker',
		);
	});

	it('returns animation for animation messages', () => {
		strictEqual(
			classifyMessageType({
				...base,
				animation: { file_id: 'x', file_unique_id: 'x', width: 100, height: 100, duration: 5 },
			} as Message),
			'animation',
		);
	});

	it('returns audio for audio messages', () => {
		strictEqual(
			classifyMessageType({
				...base,
				audio: { file_id: 'x', file_unique_id: 'x', duration: 120 },
			} as Message),
			'audio',
		);
	});

	it('returns location for location messages', () => {
		strictEqual(
			classifyMessageType({ ...base, location: { latitude: 51.5, longitude: -0.1 } } as Message),
			'location',
		);
	});

	it('returns venue for venue messages', () => {
		strictEqual(
			classifyMessageType({
				...base,
				venue: { location: { latitude: 51.5, longitude: -0.1 }, title: 'Place', address: 'Addr' },
			} as Message),
			'venue',
		);
	});

	it('returns contact for contact messages', () => {
		strictEqual(
			classifyMessageType({
				...base,
				contact: { phone_number: '+1', first_name: 'Alice' },
			} as Message),
			'contact',
		);
	});

	it('returns poll for poll messages', () => {
		strictEqual(
			classifyMessageType({
				...base,
				poll: {
					id: '1',
					question: 'Q?',
					options: [],
					total_voter_count: 0,
					is_closed: false,
					is_anonymous: true,
					type: 'regular',
					allows_multiple_answers: false,
				},
			} as Message),
			'poll',
		);
	});

	it('returns dice for dice messages', () => {
		strictEqual(
			classifyMessageType({ ...base, dice: { emoji: '🎲', value: 4 } } as Message),
			'dice',
		);
	});

	it('returns service for new_chat_members', () => {
		strictEqual(
			classifyMessageType({
				...base,
				new_chat_members: [{ id: 1, is_bot: false, first_name: 'A' }],
			} as Message),
			'service',
		);
	});

	it('returns service for left_chat_member', () => {
		strictEqual(
			classifyMessageType({
				...base,
				left_chat_member: { id: 1, is_bot: false, first_name: 'A' },
			} as Message),
			'service',
		);
	});

	it('returns service for pinned_message', () => {
		strictEqual(classifyMessageType({ ...base, pinned_message: base } as Message), 'service');
	});

	it('returns other as fallback', () => {
		strictEqual(classifyMessageType(base), 'other');
	});
});
