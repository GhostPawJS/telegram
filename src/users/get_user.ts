import type { TelegramDb } from '../database.ts';
import { mapUserRow } from './map_user_row.ts';
import type { User, UserRow } from './types.ts';

export function getUser(db: TelegramDb, userId: number): User | null {
	const row = db.prepare('SELECT * FROM users WHERE user_id = ?').get<UserRow>(userId);
	return row ? mapUserRow(row) : null;
}
