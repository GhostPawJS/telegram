import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import type { TelegramDb } from '../database.ts';
import { openTestDatabase } from '../lib/open-test-database.ts';
import { initMemberTables } from './init_member_tables.ts';
import type { Member } from './types.ts';
import { upsertMember } from './upsert_member.ts';

describe('upsertMember', () => {
	let db: TelegramDb;

	before(async () => {
		db = await openTestDatabase();
		initMemberTables(db);
	});

	const base: Member = {
		chatId: 100,
		userId: 200,
		username: 'alice',
		displayName: 'Alice',
		status: 'member',
		permissions: null,
		customTitle: null,
		updatedAt: 0,
	};

	it('inserts and returns a member', () => {
		const result = upsertMember(db, base, 1700000000000);

		assert.equal(result.chatId, 100);
		assert.equal(result.userId, 200);
		assert.equal(result.username, 'alice');
		assert.equal(result.displayName, 'Alice');
		assert.equal(result.status, 'member');
		assert.equal(result.permissions, null);
		assert.equal(result.updatedAt, 1700000000000);
	});

	it('updates an existing member (idempotent upsert)', () => {
		const updated: Member = {
			...base,
			displayName: 'Alice Updated',
			status: 'administrator',
			updatedAt: 0,
		};
		const result = upsertMember(db, updated, 1700000001000);

		assert.equal(result.displayName, 'Alice Updated');
		assert.equal(result.status, 'administrator');
		assert.equal(result.updatedAt, 1700000001000);
	});

	it('round-trips permissions JSON', () => {
		const withPerms: Member = {
			...base,
			userId: 201,
			permissions: { can_pin_messages: true, level: 5 },
			updatedAt: 0,
		};
		const result = upsertMember(db, withPerms, 1700000002000);

		assert.deepEqual(result.permissions, { can_pin_messages: true, level: 5 });
	});
});
