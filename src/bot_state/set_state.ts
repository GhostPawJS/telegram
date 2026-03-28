import type { TelegramDb } from '../database.ts';
import { resolveNow } from '../resolve_now.ts';

export function setState(db: TelegramDb, key: string, value: string, now?: number): void {
	const ts = resolveNow(now);
	db.prepare(
		`INSERT INTO bot_state (key, value, updated_at) VALUES (?, ?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
	).run(key, value, ts);
}
