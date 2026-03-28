import type { TelegramDb } from '../database.ts';
import { mapMemberRow } from './map_member_row.ts';
import type { Member, MemberRow, MemberStatus } from './types.ts';

export interface ListMembersOptions {
	status?: MemberStatus;
	limit?: number;
}

export function listMembers(
	db: TelegramDb,
	chatId: number,
	options: ListMembersOptions = {},
): Member[] {
	const { status, limit } = options;

	let sql = 'SELECT * FROM members WHERE chat_id = ?';
	const params: unknown[] = [chatId];

	if (status !== undefined) {
		sql += ' AND status = ?';
		params.push(status);
	}

	sql += ' ORDER BY display_name ASC';

	if (limit !== undefined) {
		sql += ' LIMIT ?';
		params.push(limit);
	}

	const rows = db.prepare(sql).all<MemberRow>(...params);
	return rows.map(mapMemberRow);
}
