import type { TelegramDb } from '../database.ts';
import type { BotStateRow } from './types.ts';

export function getState(db: TelegramDb, key: string): string | null {
	const row = db
		.prepare('SELECT value FROM bot_state WHERE key = ?')
		.get<Pick<BotStateRow, 'value'>>(key);
	return row ? row.value : null;
}
