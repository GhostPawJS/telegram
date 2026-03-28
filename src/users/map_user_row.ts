import type { User, UserRow } from './types.ts';

export function mapUserRow(row: UserRow): User {
	return {
		userId: row.user_id,
		isBot: row.is_bot === 1,
		username: row.username,
		firstName: row.first_name,
		lastName: row.last_name,
		displayName: row.display_name,
		languageCode: row.language_code,
		isPremium: row.is_premium === 1,
		firstSeenAt: row.first_seen_at,
		lastSeenAt: row.last_seen_at,
	};
}
