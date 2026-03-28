import type { MessageRow, MessageType, StoredMessage } from './types.ts';

function parseJson<T>(value: string | null, fallback: T): T {
	if (value === null) return fallback;
	try {
		return JSON.parse(value) as T;
	} catch {
		return fallback;
	}
}

export function mapMessageRow(row: MessageRow): StoredMessage {
	return {
		chatId: row.chat_id,
		messageId: row.message_id,
		direction: row.direction as 'in' | 'out',
		date: row.date,
		fromUserId: row.from_user_id,
		fromUsername: row.from_username,
		fromDisplayName: row.from_display_name,
		senderChatId: row.sender_chat_id,
		isAnonymousAdmin: row.is_anonymous_admin === 1,
		viaBotId: row.via_bot_id,
		type: row.type as MessageType,
		serviceKind: row.service_kind,
		text: row.text,
		textPlain: row.text_plain,
		entities: parseJson<unknown[] | null>(row.entities, null),
		mentions: parseJson<number[]>(row.mentions, []),
		mentionsBot: row.mentions_bot === 1,
		isReplyToBot: row.is_reply_to_bot === 1,
		replyToMessageId: row.reply_to_message_id,
		threadId: row.thread_id,
		mediaGroupId: row.media_group_id,
		forwardOrigin: parseJson<Record<string, unknown> | null>(row.forward_origin, null),
		media: parseJson<Record<string, unknown> | null>(row.media, null),
		hasMedia: row.has_media === 1,
		replyMarkup: parseJson<Record<string, unknown> | null>(row.reply_markup, null),
		webAppData: parseJson<Record<string, unknown> | null>(row.web_app_data, null),
		linkPreview: parseJson<Record<string, unknown> | null>(row.link_preview, null),
		effectId: row.effect_id,
		serviceData: parseJson<Record<string, unknown> | null>(row.service_data, null),
		editDate: row.edit_date,
		isDeleted: row.is_deleted === 1,
		isPinned: row.is_pinned === 1,
		raw: parseJson<Record<string, unknown>>(row.raw, {}),
		firstSeenAt: row.first_seen_at,
		updatedAt: row.updated_at,
	};
}
