import type { TelegramDb } from '../database.ts';
import { TelegramStateError } from '../errors.ts';
import { resolveNow } from '../resolve_now.ts';
import { mapCallbackRow } from './map_callback_row.ts';
import type { CallbackEntry, CallbackInput, CallbackRow } from './types.ts';

export function insertCallback(db: TelegramDb, data: CallbackInput, now?: number): CallbackEntry {
	const ts = resolveNow(now);
	db.prepare(
		`INSERT INTO callbacks (callback_id, chat_id, message_id, user_id, data, handler, payload, answered_at, expires_at, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(callback_id) DO NOTHING`,
	).run(
		data.callbackId,
		data.chatId,
		data.messageId,
		data.userId,
		data.data ?? null,
		data.handler ?? null,
		data.payload ? JSON.stringify(data.payload) : null,
		data.answeredAt ?? null,
		data.expiresAt ?? null,
		ts,
	);
	const row = db
		.prepare('SELECT * FROM callbacks WHERE callback_id = ?')
		.get<CallbackRow>(data.callbackId);
	if (!row) throw new TelegramStateError('callback row missing after upsert');
	return mapCallbackRow(row);
}
