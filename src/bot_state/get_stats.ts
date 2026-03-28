import type { TelegramDb } from '../database.ts';
import type { BotStatRow, BotStats } from './types.ts';

export function getStats(db: TelegramDb): BotStats {
	const rows = db
		.prepare('SELECT stat_key, stat_value, updated_at FROM bot_stats')
		.all<BotStatRow>();
	const map = new Map(rows.map((r) => [r.stat_key, r]));

	const get = (key: string): number => map.get(key)?.stat_value ?? 0;
	const lastUpdated = Math.max(0, ...rows.map((r) => r.updated_at));

	return {
		messagesIn: get('messages_in'),
		messagesOut: get('messages_out'),
		edits: get('edits'),
		deletes: get('deletes'),
		reactions: get('reactions'),
		callbacks: get('callbacks'),
		errors: get('errors'),
		lastUpdateId: map.has('last_update_id') ? get('last_update_id') : null,
		updatedAt: lastUpdated,
	};
}
