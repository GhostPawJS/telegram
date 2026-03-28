import { strictEqual } from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';

import type { TelegramDb } from '../database.ts';
import { openTestDatabase } from '../lib/open-test-database.ts';
import { initUserTables } from './init_user_tables.ts';
import { upsertUser } from './upsert_user.ts';

describe('upsertUser', () => {
	let db: TelegramDb;

	beforeEach(async () => {
		db = await openTestDatabase();
		initUserTables(db);
	});

	it('inserts a new user and returns a User with correct fields', () => {
		const user = upsertUser(
			db,
			{
				userId: 1,
				isBot: false,
				username: 'alice',
				firstName: 'Alice',
				lastName: 'Smith',
				displayName: 'Alice Smith',
				languageCode: 'en',
				isPremium: false,
			},
			1000,
		);
		strictEqual(user.userId, 1);
		strictEqual(user.isBot, false);
		strictEqual(user.username, 'alice');
		strictEqual(user.firstName, 'Alice');
		strictEqual(user.lastName, 'Smith');
		strictEqual(user.displayName, 'Alice Smith');
		strictEqual(user.languageCode, 'en');
		strictEqual(user.isPremium, false);
		strictEqual(user.firstSeenAt, 1000);
		strictEqual(user.lastSeenAt, 1000);
	});

	it('updates mutable fields on second call and preserves first_seen_at', () => {
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
			1000,
		);

		const updated = upsertUser(
			db,
			{
				userId: 2,
				isBot: false,
				username: 'bob_updated',
				firstName: 'Bob',
				lastName: 'Jones',
				displayName: 'Bob Jones',
				languageCode: 'fr',
				isPremium: true,
			},
			2000,
		);

		strictEqual(updated.username, 'bob_updated');
		strictEqual(updated.lastName, 'Jones');
		strictEqual(updated.languageCode, 'fr');
		strictEqual(updated.isPremium, true);
		strictEqual(updated.firstSeenAt, 1000);
		strictEqual(updated.lastSeenAt, 2000);
	});

	it('derives displayName from firstName + lastName when not provided', () => {
		const user = upsertUser(
			db,
			{
				userId: 3,
				isBot: false,
				username: null,
				firstName: 'Carol',
				lastName: 'Danvers',
				displayName: '',
				languageCode: null,
				isPremium: false,
			},
			1000,
		);
		strictEqual(user.displayName, 'Carol Danvers');
	});

	it('derives displayName from username when firstName+lastName are empty', () => {
		const user = upsertUser(
			db,
			{
				userId: 4,
				isBot: false,
				username: 'ghost',
				firstName: '',
				lastName: null,
				displayName: '',
				languageCode: null,
				isPremium: false,
			},
			1000,
		);
		strictEqual(user.displayName, 'ghost');
	});

	it('falls back to userId string when no display info available', () => {
		const user = upsertUser(
			db,
			{
				userId: 5,
				isBot: false,
				username: null,
				firstName: '',
				lastName: null,
				displayName: '',
				languageCode: null,
				isPremium: false,
			},
			1000,
		);
		strictEqual(user.displayName, '5');
	});

	it('handles isBot=true correctly', () => {
		const user = upsertUser(
			db,
			{
				userId: 6,
				isBot: true,
				username: 'mybot',
				firstName: 'My Bot',
				lastName: null,
				displayName: 'My Bot',
				languageCode: null,
				isPremium: false,
			},
			1000,
		);
		strictEqual(user.isBot, true);
	});

	it('handles isPremium=true correctly', () => {
		const user = upsertUser(
			db,
			{
				userId: 7,
				isBot: false,
				username: 'premium_user',
				firstName: 'Premium',
				lastName: null,
				displayName: 'Premium',
				languageCode: null,
				isPremium: true,
			},
			1000,
		);
		strictEqual(user.isPremium, true);
	});
});
