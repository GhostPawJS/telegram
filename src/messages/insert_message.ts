import type { TelegramDb } from '../database.ts';
import { TelegramStateError } from '../errors.ts';
import { resolveNow } from '../resolve_now.ts';
import { getMessage } from './get_message.ts';
import type { MessageInput, StoredMessage } from './types.ts';

export function insertMessage(db: TelegramDb, data: MessageInput, now?: number): StoredMessage {
	const ts = resolveNow(now);

	db.prepare(
		`INSERT INTO messages (
      chat_id, message_id, direction, date,
      from_user_id, from_username, from_display_name,
      sender_chat_id, is_anonymous_admin, via_bot_id,
      type, service_kind, text, text_plain,
      entities, mentions, mentions_bot, is_reply_to_bot,
      reply_to_message_id, thread_id, media_group_id,
      forward_origin, media, has_media,
      reply_markup, web_app_data, link_preview,
      effect_id, service_data, edit_date,
      is_deleted, is_pinned, raw,
      first_seen_at, updated_at
    ) VALUES (
      ?, ?, ?, ?,
      ?, ?, ?,
      ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?,
      ?, ?, ?,
      ?, ?, ?,
      ?, ?, ?,
      ?, ?, ?,
      ?, ?
    )
    ON CONFLICT(chat_id, message_id) DO NOTHING`,
	).run(
		data.chatId,
		data.messageId,
		data.direction,
		data.date,
		data.fromUserId ?? null,
		data.fromUsername ?? null,
		data.fromDisplayName,
		data.senderChatId ?? null,
		data.isAnonymousAdmin ? 1 : 0,
		data.viaBotId ?? null,
		data.type,
		data.serviceKind ?? null,
		data.text ?? null,
		data.textPlain ?? null,
		data.entities !== null && data.entities !== undefined ? JSON.stringify(data.entities) : null,
		JSON.stringify(data.mentions ?? []),
		data.mentionsBot ? 1 : 0,
		data.isReplyToBot ? 1 : 0,
		data.replyToMessageId ?? null,
		data.threadId ?? null,
		data.mediaGroupId ?? null,
		data.forwardOrigin !== null && data.forwardOrigin !== undefined
			? JSON.stringify(data.forwardOrigin)
			: null,
		data.media !== null && data.media !== undefined ? JSON.stringify(data.media) : null,
		data.hasMedia ? 1 : 0,
		data.replyMarkup !== null && data.replyMarkup !== undefined
			? JSON.stringify(data.replyMarkup)
			: null,
		data.webAppData !== null && data.webAppData !== undefined
			? JSON.stringify(data.webAppData)
			: null,
		data.linkPreview !== null && data.linkPreview !== undefined
			? JSON.stringify(data.linkPreview)
			: null,
		data.effectId ?? null,
		data.serviceData !== null && data.serviceData !== undefined
			? JSON.stringify(data.serviceData)
			: null,
		data.editDate ?? null,
		data.isDeleted ? 1 : 0,
		data.isPinned ? 1 : 0,
		JSON.stringify(data.raw ?? {}),
		ts,
		ts,
	);

	const msg = getMessage(db, data.chatId, data.messageId);
	if (!msg) throw new TelegramStateError('message row missing after insert');
	return msg;
}
