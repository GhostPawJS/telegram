import { strictEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { mapUserRow } from './map_user_row.ts';
import type { UserRow } from './types.ts';

const baseRow: UserRow = {
	user_id: 42,
	is_bot: 0,
	username: 'alice',
	first_name: 'Alice',
	last_name: 'Smith',
	display_name: 'Alice Smith',
	language_code: 'en',
	is_premium: 0,
	first_seen_at: 1000,
	last_seen_at: 2000,
};

describe('mapUserRow', () => {
	it('converts snake_case fields to camelCase', () => {
		const user = mapUserRow(baseRow);
		strictEqual(user.userId, 42);
		strictEqual(user.username, 'alice');
		strictEqual(user.firstName, 'Alice');
		strictEqual(user.lastName, 'Smith');
		strictEqual(user.displayName, 'Alice Smith');
		strictEqual(user.languageCode, 'en');
		strictEqual(user.firstSeenAt, 1000);
		strictEqual(user.lastSeenAt, 2000);
	});

	it('coerces is_bot=1 to true', () => {
		const user = mapUserRow({ ...baseRow, is_bot: 1 });
		strictEqual(user.isBot, true);
	});

	it('coerces is_bot=0 to false', () => {
		const user = mapUserRow({ ...baseRow, is_bot: 0 });
		strictEqual(user.isBot, false);
	});

	it('coerces is_premium=1 to true', () => {
		const user = mapUserRow({ ...baseRow, is_premium: 1 });
		strictEqual(user.isPremium, true);
	});

	it('coerces is_premium=0 to false', () => {
		const user = mapUserRow({ ...baseRow, is_premium: 0 });
		strictEqual(user.isPremium, false);
	});

	it('preserves null username', () => {
		const user = mapUserRow({ ...baseRow, username: null });
		strictEqual(user.username, null);
	});

	it('preserves null lastName', () => {
		const user = mapUserRow({ ...baseRow, last_name: null });
		strictEqual(user.lastName, null);
	});

	it('preserves null languageCode', () => {
		const user = mapUserRow({ ...baseRow, language_code: null });
		strictEqual(user.languageCode, null);
	});
});
