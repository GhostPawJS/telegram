import type { TelegramDb } from '../database.ts';
import type { ThreadSummary } from './types.ts';

interface ThreadAggRow {
	total: number;
	first_date: number;
	last_date: number;
	participant_count: number;
}

export function threadSummary(
	db: TelegramDb,
	chatId: number,
	threadId: number,
): ThreadSummary | null {
	const row = db
		.prepare(
			`SELECT
        COUNT(*) as total,
        MIN(date) as first_date,
        MAX(date) as last_date,
        COUNT(DISTINCT from_user_id) as participant_count
      FROM messages
      WHERE chat_id = ? AND thread_id = ? AND is_deleted = 0`,
		)
		.get<ThreadAggRow>(chatId, threadId);

	if (!row || row.total === 0) return null;

	return {
		chatId,
		threadId,
		total: row.total,
		firstDate: row.first_date,
		lastDate: row.last_date,
		participantCount: row.participant_count,
	};
}
