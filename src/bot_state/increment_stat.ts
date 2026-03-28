import type { TelegramDb } from '../database.ts';
import { resolveNow } from '../resolve_now.ts';

export type StatKey =
	| 'messages_in'
	| 'messages_out'
	| 'edits'
	| 'deletes'
	| 'reactions'
	| 'callbacks'
	| 'errors'
	| 'last_update_id';

export function incrementStat(db: TelegramDb, key: StatKey, by = 1, now?: number): void {
	const ts = resolveNow(now);
	db.prepare(
		`INSERT INTO bot_stats (stat_key, stat_value, updated_at) VALUES (?, ?, ?)
     ON CONFLICT(stat_key) DO UPDATE SET
       stat_value = stat_value + excluded.stat_value,
       updated_at = excluded.updated_at`,
	).run(key, by, ts);
}

export function setStat(db: TelegramDb, key: StatKey, value: number, now?: number): void {
	const ts = resolveNow(now);
	db.prepare(
		`INSERT INTO bot_stats (stat_key, stat_value, updated_at) VALUES (?, ?, ?)
     ON CONFLICT(stat_key) DO UPDATE SET
       stat_value = excluded.stat_value,
       updated_at = excluded.updated_at`,
	).run(key, value, ts);
}
