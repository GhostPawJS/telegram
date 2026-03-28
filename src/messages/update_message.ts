import type { TelegramDb } from '../database.ts';
import { TelegramNotFoundError, TelegramStateError } from '../errors.ts';
import { resolveNow } from '../resolve_now.ts';
import { getMessage } from './get_message.ts';
import type { StoredMessage } from './types.ts';

const camelToSnake: Record<keyof StoredMessage, string> = {
	chatId: 'chat_id',
	messageId: 'message_id',
	direction: 'direction',
	date: 'date',
	fromUserId: 'from_user_id',
	fromUsername: 'from_username',
	fromDisplayName: 'from_display_name',
	senderChatId: 'sender_chat_id',
	isAnonymousAdmin: 'is_anonymous_admin',
	viaBotId: 'via_bot_id',
	type: 'type',
	serviceKind: 'service_kind',
	text: 'text',
	textPlain: 'text_plain',
	entities: 'entities',
	mentions: 'mentions',
	mentionsBot: 'mentions_bot',
	isReplyToBot: 'is_reply_to_bot',
	replyToMessageId: 'reply_to_message_id',
	threadId: 'thread_id',
	mediaGroupId: 'media_group_id',
	forwardOrigin: 'forward_origin',
	media: 'media',
	hasMedia: 'has_media',
	replyMarkup: 'reply_markup',
	webAppData: 'web_app_data',
	linkPreview: 'link_preview',
	effectId: 'effect_id',
	serviceData: 'service_data',
	editDate: 'edit_date',
	isDeleted: 'is_deleted',
	isPinned: 'is_pinned',
	raw: 'raw',
	firstSeenAt: 'first_seen_at',
	updatedAt: 'updated_at',
};

const jsonColumns = new Set([
	'entities',
	'mentions',
	'forwardOrigin',
	'media',
	'replyMarkup',
	'webAppData',
	'linkPreview',
	'serviceData',
	'raw',
]);

const boolColumns = new Set([
	'isAnonymousAdmin',
	'mentionsBot',
	'isReplyToBot',
	'hasMedia',
	'isDeleted',
	'isPinned',
]);

function serializeValue(key: string, value: unknown): unknown {
	if (value === undefined) return null;
	if (jsonColumns.has(key)) {
		return value !== null ? JSON.stringify(value) : null;
	}
	if (boolColumns.has(key)) {
		return value ? 1 : 0;
	}
	return value;
}

export function updateMessage(
	db: TelegramDb,
	chatId: number,
	messageId: number,
	patch: Partial<StoredMessage>,
	now?: number,
): StoredMessage {
	const ts = resolveNow(now);
	const setClauses: string[] = ['updated_at = ?'];
	const params: unknown[] = [ts];

	for (const [key, value] of Object.entries(patch)) {
		const col = camelToSnake[key as keyof StoredMessage];
		if (!col || col === 'chat_id' || col === 'message_id' || col === 'first_seen_at') continue;
		setClauses.push(`${col} = ?`);
		params.push(serializeValue(key, value));
	}

	params.push(chatId, messageId);

	const result = db
		.prepare(`UPDATE messages SET ${setClauses.join(', ')} WHERE chat_id = ? AND message_id = ?`)
		.run(...params);

	if (!result.changes || result.changes === 0) {
		throw new TelegramNotFoundError(`Message not found: chatId=${chatId}, messageId=${messageId}`);
	}

	const msg = getMessage(db, chatId, messageId);
	if (!msg) throw new TelegramStateError('message row missing after update');
	return msg;
}
