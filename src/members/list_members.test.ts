import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import type { TelegramDb } from '../database.ts';
import { openTestDatabase } from '../lib/open-test-database.ts';
import { initMemberTables } from './init_member_tables.ts';
import { listMembers } from './list_members.ts';
import type { Member } from './types.ts';
import { upsertMember } from './upsert_member.ts';

describe('listMembers', () => {
	let db: TelegramDb;

	before(async () => {
		db = await openTestDatabase();
		initMemberTables(db);

		const members: Member[] = [
			{
				chatId: 100,
				userId: 1,
				username: 'alice',
				displayName: 'Alice',
				status: 'member',
				permissions: null,
				customTitle: null,
				updatedAt: 0,
			},
			{
				chatId: 100,
				userId: 2,
				username: 'bob',
				displayName: 'Bob',
				status: 'administrator',
				permissions: null,
				customTitle: null,
				updatedAt: 0,
			},
			{
				chatId: 100,
				userId: 3,
				username: null,
				displayName: 'Carol',
				status: 'member',
				permissions: null,
				customTitle: null,
				updatedAt: 0,
			},
		];

		for (const m of members) {
			upsertMember(db, m, 1700000000000);
		}
	});

	it('returns an empty array for a chat with no members', () => {
		const results = listMembers(db, 999);
		assert.deepEqual(results, []);
	});

	it('returns all members for a chat', () => {
		const results = listMembers(db, 100);
		assert.equal(results.length, 3);
	});

	it('orders results by display_name ascending', () => {
		const results = listMembers(db, 100);
		const names = results.map((m) => m.displayName);
		assert.deepEqual(names, ['Alice', 'Bob', 'Carol']);
	});

	it('filters by status', () => {
		const results = listMembers(db, 100, { status: 'administrator' });
		assert.equal(results.length, 1);
		assert.equal(results[0]?.username, 'bob');
	});

	it('respects the limit option', () => {
		const results = listMembers(db, 100, { limit: 2 });
		assert.equal(results.length, 2);
	});

	it('combines status filter and limit', () => {
		const results = listMembers(db, 100, { status: 'member', limit: 1 });
		assert.equal(results.length, 1);
		assert.equal(results[0]?.displayName, 'Alice');
	});
});
