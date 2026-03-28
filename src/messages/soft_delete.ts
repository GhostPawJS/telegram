import type { TelegramDb } from '../database.ts';
import { resolveNow } from '../resolve_now.ts';

export function softDelete(db: TelegramDb, chatId: number, messageId: number, now?: number): void {
	const ts = resolveNow(now);
	db.prepare(
		'UPDATE messages SET is_deleted = 1, updated_at = ? WHERE chat_id = ? AND message_id = ?',
	).run(ts, chatId, messageId);
}
