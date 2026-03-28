import { strictEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { Message } from 'grammy/types';

import { classifyServiceKind } from './classify_service_kind.ts';

const base: Message = {
	message_id: 1,
	date: 1000000,
	chat: { id: 1, type: 'private', first_name: 'A' },
} as unknown as Message;

describe('classifyServiceKind', () => {
	it('returns null for text messages', () => {
		strictEqual(classifyServiceKind({ ...base, text: 'hello' } as Message), null);
	});

	it('returns new_chat_members', () => {
		strictEqual(
			classifyServiceKind({
				...base,
				new_chat_members: [{ id: 2, is_bot: false, first_name: 'B' }],
			} as Message),
			'new_chat_members',
		);
	});

	it('returns left_chat_member', () => {
		strictEqual(
			classifyServiceKind({
				...base,
				left_chat_member: { id: 2, is_bot: false, first_name: 'B' },
			} as Message),
			'left_chat_member',
		);
	});

	it('returns new_chat_title', () => {
		strictEqual(
			classifyServiceKind({ ...base, new_chat_title: 'New Title' } as Message),
			'new_chat_title',
		);
	});

	it('returns pinned_message', () => {
		strictEqual(
			classifyServiceKind({ ...base, pinned_message: base } as Message),
			'pinned_message',
		);
	});

	it('returns migrate_to_chat_id', () => {
		strictEqual(
			classifyServiceKind({ ...base, migrate_to_chat_id: -100123 } as Message),
			'migrate_to_chat_id',
		);
	});

	it('returns migrate_from_chat_id', () => {
		strictEqual(
			classifyServiceKind({ ...base, migrate_from_chat_id: -100456 } as Message),
			'migrate_from_chat_id',
		);
	});

	it('returns forum_topic_created', () => {
		strictEqual(
			classifyServiceKind({
				...base,
				forum_topic_created: { name: 'Topic', icon_color: 0x6fb9f0 },
			} as Message),
			'forum_topic_created',
		);
	});

	it('returns write_access_allowed', () => {
		strictEqual(
			classifyServiceKind({ ...base, write_access_allowed: {} } as Message),
			'write_access_allowed',
		);
	});

	it('returns null for plain base message', () => {
		strictEqual(classifyServiceKind(base), null);
	});
});
