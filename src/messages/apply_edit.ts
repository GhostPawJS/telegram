import type { TelegramDb } from '../database.ts';
import { TelegramNotFoundError } from '../errors.ts';
import { resolveNow } from '../resolve_now.ts';
import { withTransaction } from '../with_transaction.ts';
import { getMessage } from './get_message.ts';
import type { StoredMessage } from './types.ts';
import { updateMessage } from './update_message.ts';

export interface EditPayload {
	text?: string | null;
	entities?: unknown[] | null;
	media?: Record<string, unknown> | null;
	editDate?: number | null;
}

export function applyEdit(
	db: TelegramDb,
	chatId: number,
	messageId: number,
	edit: EditPayload,
	now?: number,
): StoredMessage {
	const ts = resolveNow(now);

	return withTransaction(db, () => {
		const current = getMessage(db, chatId, messageId);
		if (!current) {
			throw new TelegramNotFoundError(
				`Message not found: chatId=${chatId}, messageId=${messageId}`,
			);
		}

		db.prepare(
			`INSERT INTO message_edits (chat_id, message_id, text, entities, media, edit_date, captured_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
		).run(
			chatId,
			messageId,
			current.text ?? null,
			current.entities !== null ? JSON.stringify(current.entities) : null,
			current.media !== null ? JSON.stringify(current.media) : null,
			current.editDate ?? null,
			ts,
		);

		const patch: Partial<StoredMessage> = {};
		if ('text' in edit) patch.text = edit.text ?? null;
		if ('entities' in edit) patch.entities = edit.entities ?? null;
		if ('media' in edit) patch.media = edit.media ?? null;
		if ('editDate' in edit) patch.editDate = edit.editDate ?? null;

		return updateMessage(db, chatId, messageId, patch, ts);
	});
}
