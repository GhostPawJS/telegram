import type { TelegramDb } from '../database.ts';
import { TelegramStateError } from '../errors.ts';
import { resolveNow } from '../resolve_now.ts';
import { mapMemberRow } from './map_member_row.ts';
import type { Member, MemberRow } from './types.ts';

export function upsertMember(db: TelegramDb, data: Member, now?: number): Member {
	const ts = resolveNow(now);
	db.prepare(
		`INSERT INTO members (chat_id, user_id, username, display_name, status, permissions, custom_title, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(chat_id, user_id) DO UPDATE SET
       username     = excluded.username,
       display_name = excluded.display_name,
       status       = excluded.status,
       permissions  = excluded.permissions,
       custom_title = excluded.custom_title,
       updated_at   = excluded.updated_at`,
	).run(
		data.chatId,
		data.userId,
		data.username ?? null,
		data.displayName,
		data.status,
		data.permissions ? JSON.stringify(data.permissions) : null,
		data.customTitle ?? null,
		ts,
	);
	const row = db
		.prepare('SELECT * FROM members WHERE chat_id = ? AND user_id = ?')
		.get<MemberRow>(data.chatId, data.userId);
	if (!row) throw new TelegramStateError('member row missing after upsert');
	return mapMemberRow(row);
}
