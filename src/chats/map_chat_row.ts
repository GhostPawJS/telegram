import type { AvailableReactions, Chat, ChatRow, ChatType } from './types.ts';

export function mapChatRow(row: ChatRow): Chat {
	return {
		chatId: row.chat_id,
		type: row.type as ChatType,
		title: row.title,
		username: row.username,
		firstName: row.first_name,
		lastName: row.last_name,
		isForum: row.is_forum === 1,
		memberCount: row.member_count,
		photoFileId: row.photo_file_id,
		isActive: row.is_active === 1,
		permissions: row.permissions ? (JSON.parse(row.permissions) as Record<string, unknown>) : null,
		availableReactions: row.available_reactions
			? (JSON.parse(row.available_reactions) as AvailableReactions)
			: null,
		lastMessageAt: row.last_message_at,
		metadata: JSON.parse(row.metadata) as Record<string, unknown>,
		createdAt: row.created_at,
		updatedAt: row.updated_at,
	};
}
