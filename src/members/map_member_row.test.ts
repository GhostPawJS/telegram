import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { mapMemberRow } from './map_member_row.ts';
import type { MemberRow } from './types.ts';

describe('mapMemberRow', () => {
	it('maps snake_case fields to camelCase', () => {
		const row: MemberRow = {
			chat_id: 100,
			user_id: 200,
			username: 'alice',
			display_name: 'Alice',
			status: 'member',
			permissions: null,
			custom_title: null,
			updated_at: 1700000000000,
		};

		const member = mapMemberRow(row);

		assert.equal(member.chatId, 100);
		assert.equal(member.userId, 200);
		assert.equal(member.username, 'alice');
		assert.equal(member.displayName, 'Alice');
		assert.equal(member.status, 'member');
		assert.equal(member.permissions, null);
		assert.equal(member.customTitle, null);
		assert.equal(member.updatedAt, 1700000000000);
	});

	it('parses permissions JSON', () => {
		const row: MemberRow = {
			chat_id: 100,
			user_id: 201,
			username: null,
			display_name: 'Bob',
			status: 'administrator',
			permissions: '{"can_pin_messages":true,"can_delete_messages":false}',
			custom_title: 'Mod',
			updated_at: 1700000000001,
		};

		const member = mapMemberRow(row);

		assert.deepEqual(member.permissions, { can_pin_messages: true, can_delete_messages: false });
		assert.equal(member.customTitle, 'Mod');
	});

	it('returns null permissions when field is null', () => {
		const row: MemberRow = {
			chat_id: 100,
			user_id: 202,
			username: null,
			display_name: 'Carol',
			status: 'left',
			permissions: null,
			custom_title: null,
			updated_at: 1700000000002,
		};

		const member = mapMemberRow(row);
		assert.equal(member.permissions, null);
	});
});
