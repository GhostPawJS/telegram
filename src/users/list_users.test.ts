import { strictEqual } from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';

import type { TelegramDb } from '../database.ts';
import { openTestDatabase } from '../lib/open-test-database.ts';
import { initUserTables } from './init_user_tables.ts';
import { listUsers } from './list_users.ts';
import { upsertUser } from './upsert_user.ts';

describe('listUsers', () => {
	let db: TelegramDb;

	beforeEach(async () => {
		db = await openTestDatabase();
		initUserTables(db);
	});

	it('returns empty array when no users exist', () => {
		const result = listUsers(db);
		strictEqual(result.length, 0);
	});

	it('returns users ordered by last_seen_at DESC', () => {
		upsertUser(
			db,
			{
				userId: 1,
				isBot: false,
				username: 'alice',
				firstName: 'Alice',
				lastName: null,
				displayName: 'Alice',
				languageCode: null,
				isPremium: false,
			},
			1000,
		);
		upsertUser(
			db,
			{
				userId: 2,
				isBot: false,
				username: 'bob',
				firstName: 'Bob',
				lastName: null,
				displayName: 'Bob',
				languageCode: null,
				isPremium: false,
			},
			3000,
		);
		upsertUser(
			db,
			{
				userId: 3,
				isBot: false,
				username: 'carol',
				firstName: 'Carol',
				lastName: null,
				displayName: 'Carol',
				languageCode: null,
				isPremium: false,
			},
			2000,
		);

		const result = listUsers(db);
		strictEqual(result.length, 3);
		strictEqual(result[0]?.userId, 2);
		strictEqual(result[1]?.userId, 3);
		strictEqual(result[2]?.userId, 1);
	});

	it('filters by isBot=true', () => {
		upsertUser(
			db,
			{
				userId: 1,
				isBot: false,
				username: 'alice',
				firstName: 'Alice',
				lastName: null,
				displayName: 'Alice',
				languageCode: null,
				isPremium: false,
			},
			1000,
		);
		upsertUser(
			db,
			{
				userId: 2,
				isBot: true,
				username: 'mybot',
				firstName: 'My Bot',
				lastName: null,
				displayName: 'My Bot',
				languageCode: null,
				isPremium: false,
			},
			2000,
		);

		const bots = listUsers(db, { isBot: true });
		strictEqual(bots.length, 1);
		strictEqual(bots[0]?.userId, 2);
		strictEqual(bots[0]?.isBot, true);
	});

	it('filters by isBot=false', () => {
		upsertUser(
			db,
			{
				userId: 1,
				isBot: false,
				username: 'alice',
				firstName: 'Alice',
				lastName: null,
				displayName: 'Alice',
				languageCode: null,
				isPremium: false,
			},
			1000,
		);
		upsertUser(
			db,
			{
				userId: 2,
				isBot: true,
				username: 'mybot',
				firstName: 'My Bot',
				lastName: null,
				displayName: 'My Bot',
				languageCode: null,
				isPremium: false,
			},
			2000,
		);

		const humans = listUsers(db, { isBot: false });
		strictEqual(humans.length, 1);
		strictEqual(humans[0]?.userId, 1);
	});

	it('respects limit', () => {
		for (let i = 1; i <= 5; i++) {
			upsertUser(
				db,
				{
					userId: i,
					isBot: false,
					username: null,
					firstName: `User${i}`,
					lastName: null,
					displayName: `User${i}`,
					languageCode: null,
					isPremium: false,
				},
				i * 1000,
			);
		}

		const result = listUsers(db, { limit: 2 });
		strictEqual(result.length, 2);
	});

	it('respects offset', () => {
		for (let i = 1; i <= 5; i++) {
			upsertUser(
				db,
				{
					userId: i,
					isBot: false,
					username: null,
					firstName: `User${i}`,
					lastName: null,
					displayName: `User${i}`,
					languageCode: null,
					isPremium: false,
				},
				i * 1000,
			);
		}

		// Ordered by last_seen_at DESC: 5, 4, 3, 2, 1
		const result = listUsers(db, { limit: 2, offset: 2 });
		strictEqual(result.length, 2);
		strictEqual(result[0]?.userId, 3);
		strictEqual(result[1]?.userId, 2);
	});
});
