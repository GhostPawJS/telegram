import { strictEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { User } from 'grammy/types';

import { normalizeUser } from './normalize_user.ts';

describe('normalizeUser', () => {
	it('maps basic user fields correctly', () => {
		const user: User = { id: 42, is_bot: false, first_name: 'Alice' };
		const result = normalizeUser(user);
		strictEqual(result.userId, 42);
		strictEqual(result.isBot, false);
		strictEqual(result.firstName, 'Alice');
		strictEqual(result.lastName, null);
		strictEqual(result.username, null);
		strictEqual(result.languageCode, null);
		strictEqual(result.isPremium, false);
		strictEqual(result.displayName, 'Alice');
	});

	it('includes last_name in displayName', () => {
		const user: User = { id: 1, is_bot: false, first_name: 'Bob', last_name: 'Jones' };
		const result = normalizeUser(user);
		strictEqual(result.displayName, 'Bob Jones');
		strictEqual(result.lastName, 'Jones');
	});

	it('sets isPremium=true for premium users', () => {
		const user: User = { id: 1, is_bot: false, first_name: 'Carol', is_premium: true };
		const result = normalizeUser(user);
		strictEqual(result.isPremium, true);
	});

	it('sets username when present', () => {
		const user: User = { id: 1, is_bot: false, first_name: 'Dave', username: 'daved' };
		const result = normalizeUser(user);
		strictEqual(result.username, 'daved');
	});

	it('sets username=null when absent', () => {
		const user: User = { id: 1, is_bot: false, first_name: 'Eve' };
		const result = normalizeUser(user);
		strictEqual(result.username, null);
	});

	it('maps languageCode', () => {
		const user: User = { id: 1, is_bot: false, first_name: 'Frank', language_code: 'de' };
		const result = normalizeUser(user);
		strictEqual(result.languageCode, 'de');
	});

	it('sets isBot=true for bots', () => {
		const user: User = { id: 1, is_bot: true, first_name: 'BotName' };
		const result = normalizeUser(user);
		strictEqual(result.isBot, true);
	});
});
