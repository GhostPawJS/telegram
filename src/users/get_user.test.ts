import { strictEqual } from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';

import type { TelegramDb } from '../database.ts';
import { openTestDatabase } from '../lib/open-test-database.ts';
import { getUser } from './get_user.ts';
import { initUserTables } from './init_user_tables.ts';
import { upsertUser } from './upsert_user.ts';

describe('getUser', () => {
	let db: TelegramDb;

	beforeEach(async () => {
		db = await openTestDatabase();
		initUserTables(db);
	});

	it('returns null for an unknown userId', () => {
		const result = getUser(db, 9999);
		strictEqual(result, null);
	});

	it('returns the User for a known userId', () => {
		upsertUser(
			db,
			{
				userId: 1,
				isBot: false,
				username: 'alice',
				firstName: 'Alice',
				lastName: null,
				displayName: 'Alice',
				languageCode: 'en',
				isPremium: false,
			},
			1000,
		);

		const user = getUser(db, 1);
		strictEqual(user?.userId, 1);
		strictEqual(user?.username, 'alice');
		strictEqual(user?.firstName, 'Alice');
		strictEqual(user?.firstSeenAt, 1000);
	});
});
