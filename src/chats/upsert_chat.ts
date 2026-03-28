import type { TelegramDb } from '../database.ts';
import { TelegramStateError } from '../errors.ts';
import { resolveNow } from '../resolve_now.ts';
import { mapChatRow } from './map_chat_row.ts';
import type { Chat, ChatInput, ChatRow } from './types.ts';

export function upsertChat(db: TelegramDb, data: ChatInput, now?: number): Chat {
	const ts = resolveNow(now);
	db.prepare(
		`INSERT INTO chats (chat_id, type, title, username, first_name, last_name, is_forum, member_count, photo_file_id, is_active, permissions, available_reactions, last_message_at, metadata, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(chat_id) DO UPDATE SET
       type                = excluded.type,
       title               = excluded.title,
       username            = excluded.username,
       first_name          = excluded.first_name,
       last_name           = excluded.last_name,
       is_forum            = excluded.is_forum,
       member_count        = excluded.member_count,
       photo_file_id       = excluded.photo_file_id,
       is_active           = excluded.is_active,
       permissions         = excluded.permissions,
       available_reactions = excluded.available_reactions,
       last_message_at     = excluded.last_message_at,
       metadata            = excluded.metadata,
       updated_at          = excluded.updated_at`,
	).run(
		data.chatId,
		data.type,
		data.title ?? null,
		data.username ?? null,
		data.firstName ?? null,
		data.lastName ?? null,
		data.isForum ? 1 : 0,
		data.memberCount ?? null,
		data.photoFileId ?? null,
		data.isActive ? 1 : 0,
		data.permissions ? JSON.stringify(data.permissions) : null,
		data.availableReactions ? JSON.stringify(data.availableReactions) : null,
		data.lastMessageAt ?? null,
		JSON.stringify(data.metadata ?? {}),
		ts,
		ts,
	);

	const row = db.prepare('SELECT * FROM chats WHERE chat_id = ?').get<ChatRow>(data.chatId);
	if (!row) throw new TelegramStateError('chat row missing after upsert');
	return mapChatRow(row);
}
