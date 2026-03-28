import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import type { TelegramDb } from '../database.ts';
import { openTestDatabase } from '../lib/open-test-database.ts';
import { getMember } from './get_member.ts';
import { initMemberTables } from './init_member_tables.ts';
import type { Member } from './types.ts';
import { upsertMember } from './upsert_member.ts';

describe('getMember', () => {
	let db: TelegramDb;

	before(async () => {
		db = await openTestDatabase();
		initMemberTables(db);
	});

	it('returns null for an unknown member', () => {
		const result = getMember(db, 999, 999);
		assert.equal(result, null);
	});

	it('returns a Member for a known member', () => {
		const data: Member = {
			chatId: 100,
			userId: 300,
			username: 'dave',
			displayName: 'Dave',
			status: 'member',
			permissions: null,
			customTitle: null,
			updatedAt: 0,
		};
		upsertMember(db, data, 1700000000000);

		const result = getMember(db, 100, 300);
		assert.ok(result !== null);
		assert.equal(result.chatId, 100);
		assert.equal(result.userId, 300);
		assert.equal(result.username, 'dave');
		assert.equal(result.displayName, 'Dave');
		assert.equal(result.status, 'member');
	});
});
