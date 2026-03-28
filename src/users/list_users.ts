import type { TelegramDb } from '../database.ts';
import { mapUserRow } from './map_user_row.ts';
import type { User, UserFilter, UserRow } from './types.ts';

export function listUsers(db: TelegramDb, filter: UserFilter = {}): User[] {
	const conditions: string[] = [];
	const params: unknown[] = [];

	if (filter.isBot !== undefined) {
		conditions.push('is_bot = ?');
		params.push(filter.isBot ? 1 : 0);
	}

	const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
	const limit = filter.limit ?? 50;
	const offset = filter.offset ?? 0;

	const rows = db
		.prepare(`SELECT * FROM users ${where} ORDER BY last_seen_at DESC LIMIT ? OFFSET ?`)
		.all<UserRow>(...params, limit, offset);

	return rows.map(mapUserRow);
}
