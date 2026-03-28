import type { CallbackEntry, CallbackRow } from './types.ts';

export function mapCallbackRow(row: CallbackRow): CallbackEntry {
	return {
		callbackId: row.callback_id,
		chatId: row.chat_id,
		messageId: row.message_id,
		userId: row.user_id,
		data: row.data,
		handler: row.handler,
		payload: row.payload ? (JSON.parse(row.payload) as Record<string, unknown>) : null,
		answeredAt: row.answered_at,
		expiresAt: row.expires_at,
		createdAt: row.created_at,
	};
}
