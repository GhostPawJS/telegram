import type { TelegramDb } from '../database.ts';
import { TelegramStateError } from '../errors.ts';
import { resolveNow } from '../resolve_now.ts';
import { mapUserRow } from './map_user_row.ts';
import type { User, UserInput, UserRow } from './types.ts';

export function upsertUser(db: TelegramDb, data: UserInput, now?: number): User {
	const ts = resolveNow(now);
	const displayName =
		data.displayName ||
		[data.firstName, data.lastName].filter(Boolean).join(' ') ||
		data.username ||
		String(data.userId);

	db.prepare(
		`INSERT INTO users (user_id, is_bot, username, first_name, last_name, display_name, language_code, is_premium, first_seen_at, last_seen_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(user_id) DO UPDATE SET
       username      = excluded.username,
       first_name    = excluded.first_name,
       last_name     = excluded.last_name,
       display_name  = excluded.display_name,
       language_code = excluded.language_code,
       is_premium    = excluded.is_premium,
       last_seen_at  = excluded.last_seen_at`,
	).run(
		data.userId,
		data.isBot ? 1 : 0,
		data.username ?? null,
		data.firstName,
		data.lastName ?? null,
		displayName,
		data.languageCode ?? null,
		data.isPremium ? 1 : 0,
		ts,
		ts,
	);

	const row = db.prepare('SELECT * FROM users WHERE user_id = ?').get<UserRow>(data.userId);
	if (!row) throw new TelegramStateError('user row missing after upsert');
	return mapUserRow(row);
}
