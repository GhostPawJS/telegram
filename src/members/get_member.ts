import type { TelegramDb } from '../database.ts';
import { mapMemberRow } from './map_member_row.ts';
import type { Member, MemberRow } from './types.ts';

export function getMember(db: TelegramDb, chatId: number, userId: number): Member | null {
	const row = db
		.prepare('SELECT * FROM members WHERE chat_id = ? AND user_id = ?')
		.get<MemberRow>(chatId, userId);
	return row ? mapMemberRow(row) : null;
}
