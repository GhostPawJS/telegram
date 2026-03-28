import { deepStrictEqual, strictEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { ChatMember } from 'grammy/types';

import { normalizeMember } from './normalize_member.ts';

const baseUser = { id: 42, is_bot: false, first_name: 'Alice', username: 'alice' };

describe('normalizeMember', () => {
	it('maps regular member status correctly', () => {
		const member: ChatMember = { status: 'member', user: baseUser };
		const result = normalizeMember(100, member, 1000);
		strictEqual(result.chatId, 100);
		strictEqual(result.userId, 42);
		strictEqual(result.username, 'alice');
		strictEqual(result.displayName, 'Alice');
		strictEqual(result.status, 'member');
		strictEqual(result.permissions, null);
		strictEqual(result.customTitle, null);
		strictEqual(result.updatedAt, 1000);
	});

	it('maps administrator with custom_title', () => {
		const member: ChatMember = {
			status: 'administrator',
			user: baseUser,
			can_be_edited: false,
			is_anonymous: false,
			can_manage_chat: true,
			can_delete_messages: true,
			can_manage_video_chats: false,
			can_restrict_members: false,
			can_promote_members: false,
			can_change_info: true,
			can_invite_users: true,
			can_post_stories: false,
			can_edit_stories: false,
			can_delete_stories: false,
			custom_title: 'Head Admin',
		};
		const result = normalizeMember(100, member, 2000);
		strictEqual(result.status, 'administrator');
		strictEqual(result.customTitle, 'Head Admin');
	});

	it('maps restricted member with permissions object', () => {
		const member: ChatMember = {
			status: 'restricted',
			user: baseUser,
			is_member: true,
			can_send_messages: false,
			can_send_audios: false,
			can_send_documents: false,
			can_send_photos: false,
			can_send_videos: false,
			can_send_video_notes: false,
			can_send_voice_notes: false,
			can_send_polls: false,
			can_send_other_messages: false,
			can_add_web_page_previews: false,
			can_change_info: false,
			can_invite_users: false,
			can_pin_messages: false,
			can_manage_topics: false,
			can_edit_tag: false,
			until_date: 0,
		};
		const result = normalizeMember(100, member, 3000);
		strictEqual(result.status, 'restricted');
		strictEqual(typeof result.permissions, 'object');
		strictEqual(result.permissions !== null, true);
		deepStrictEqual((result.permissions as Record<string, unknown>).can_send_messages, false);
	});

	it('maps left member', () => {
		const member: ChatMember = { status: 'left', user: baseUser };
		const result = normalizeMember(100, member, 4000);
		strictEqual(result.status, 'left');
		strictEqual(result.permissions, null);
	});

	it('uses Date.now() when now is not provided', () => {
		const before = Date.now();
		const member: ChatMember = { status: 'member', user: baseUser };
		const result = normalizeMember(100, member);
		const after = Date.now();
		strictEqual(result.updatedAt >= before, true);
		strictEqual(result.updatedAt <= after, true);
	});

	it('includes last_name in displayName', () => {
		const user = { ...baseUser, last_name: 'Smith' };
		const member: ChatMember = { status: 'member', user };
		const result = normalizeMember(100, member, 1000);
		strictEqual(result.displayName, 'Alice Smith');
	});

	it('maps creator status correctly', () => {
		const member: ChatMember = { status: 'creator', user: baseUser, is_anonymous: false };
		const result = normalizeMember(100, member, 5000);
		strictEqual(result.status, 'creator');
		strictEqual(result.permissions, null);
		strictEqual(result.customTitle, null);
	});

	it('maps creator with custom_title', () => {
		const member: ChatMember = {
			status: 'creator',
			user: baseUser,
			is_anonymous: false,
			custom_title: 'Owner',
		};
		const result = normalizeMember(100, member, 5000);
		strictEqual(result.customTitle, 'Owner');
	});

	it('maps kicked (banned) member', () => {
		const member: ChatMember = {
			status: 'kicked',
			user: baseUser,
			until_date: 0,
		};
		const result = normalizeMember(100, member, 6000);
		strictEqual(result.status, 'kicked');
		strictEqual(result.permissions, null);
	});
});
