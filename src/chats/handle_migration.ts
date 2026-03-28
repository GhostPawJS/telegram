import type { TelegramDb } from '../database.ts';
import { resolveNow } from '../resolve_now.ts';
import { withTransaction } from '../with_transaction.ts';

export function handleMigration(
	db: TelegramDb,
	fromChatId: number,
	toChatId: number,
	now?: number,
): void {
	const ts = resolveNow(now);
	withTransaction(db, () => {
		// Mark old chat inactive and record migration target in metadata
		const oldRow = db
			.prepare('SELECT metadata FROM chats WHERE chat_id = ?')
			.get<{ metadata: string }>(fromChatId);
		if (oldRow) {
			const meta = JSON.parse(oldRow.metadata) as Record<string, unknown>;
			meta.migratedToChatId = toChatId;
			meta.migratedAt = ts;
			db.prepare(
				'UPDATE chats SET is_active = 0, metadata = ?, updated_at = ? WHERE chat_id = ?',
			).run(JSON.stringify(meta), ts, fromChatId);
		}
		// Record migration source in new chat's metadata
		const newRow = db
			.prepare('SELECT metadata FROM chats WHERE chat_id = ?')
			.get<{ metadata: string }>(toChatId);
		if (newRow) {
			const meta = JSON.parse(newRow.metadata) as Record<string, unknown>;
			meta.migratedFromChatId = fromChatId;
			meta.migratedAt = ts;
			db.prepare('UPDATE chats SET metadata = ?, updated_at = ? WHERE chat_id = ?').run(
				JSON.stringify(meta),
				ts,
				toChatId,
			);
		}
	});
}
