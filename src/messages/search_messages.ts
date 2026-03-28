import type { TelegramDb } from '../database.ts';
import type { SearchOpts, SearchResult } from './types.ts';

interface SearchRow {
	chat_id: number;
	message_id: number;
	date: number;
	snippet: string;
}

export function searchMessages(
	db: TelegramDb,
	chatId: number,
	query: string,
	opts: SearchOpts = {},
): SearchResult[] {
	const limit = opts.limit ?? 20;
	const highlightStart = opts.highlightStart ?? '<b>';
	const highlightEnd = opts.highlightEnd ?? '</b>';

	const rows = db
		.prepare(
			`SELECT m.chat_id, m.message_id, m.date,
        snippet(messages_fts, 0, ?, ?, '...', 64) as snippet
      FROM messages_fts
      JOIN messages m ON messages_fts.rowid = m.rowid
      WHERE messages_fts MATCH ? AND m.chat_id = ? AND m.is_deleted = 0
      ORDER BY m.date DESC
      LIMIT ?`,
		)
		.all<SearchRow>(highlightStart, highlightEnd, query, chatId, limit);

	return rows.map((row) => ({
		chatId: row.chat_id,
		messageId: row.message_id,
		date: row.date,
		snippet: row.snippet,
	}));
}
