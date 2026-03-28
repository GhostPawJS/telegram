import type { TelegramDb } from '../database.ts';
import { TelegramNotFoundError } from '../errors.ts';
import { resolveNow } from '../resolve_now.ts';

export function markAnswered(db: TelegramDb, callbackId: string, now?: number): void {
	const ts = resolveNow(now);
	const result = db
		.prepare('UPDATE callbacks SET answered_at = ? WHERE callback_id = ?')
		.run(ts, callbackId);
	if ((result.changes ?? 0) === 0) {
		throw new TelegramNotFoundError(`callback ${callbackId} not found`);
	}
}
