import type { TelegramDb } from '../database.ts';
import { mapMessageRow } from './map_message_row.ts';
import type { MessageRow, StoredMessage } from './types.ts';

export function replyChain(
	db: TelegramDb,
	chatId: number,
	messageId: number,
	maxDepth = 50,
): StoredMessage[] {
	const rows = db
		.prepare(
			`WITH RECURSIVE chain(chat_id, message_id, reply_to, depth) AS (
        SELECT chat_id, message_id, reply_to_message_id, 0
        FROM messages
        WHERE chat_id = ? AND message_id = ?
        UNION ALL
        SELECT m.chat_id, m.message_id, m.reply_to_message_id, c.depth + 1
        FROM messages m
        JOIN chain c ON m.chat_id = c.chat_id AND m.message_id = c.reply_to
        WHERE c.depth < ? AND c.reply_to IS NOT NULL
      )
      SELECT m.*
      FROM messages m
      WHERE (m.chat_id, m.message_id) IN (SELECT chat_id, message_id FROM chain)
      ORDER BY m.date ASC`,
		)
		.all<MessageRow>(chatId, messageId, maxDepth);

	return rows.map(mapMessageRow);
}
