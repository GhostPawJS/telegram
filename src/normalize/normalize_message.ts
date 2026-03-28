import type { Message as GrammyMessage, MessageEntity } from 'grammy/types';

import type { MessageInput } from '../messages/types.ts';
import { classifyMessageType } from './classify_message_type.ts';
import { classifyServiceKind } from './classify_service_kind.ts';
import { extractMedia } from './extract_media.ts';
import { resolveSender } from './resolve_sender.ts';

function extractMentions(entities: MessageEntity[] | undefined): number[] {
	if (!entities) return [];
	const ids: number[] = [];
	for (const entity of entities) {
		if (entity.type === 'text_mention' && entity.user) {
			ids.push(entity.user.id);
		}
	}
	return ids;
}

function buildServiceData(
	serviceKind: string | null,
	msg: GrammyMessage,
): Record<string, unknown> | null {
	if (!serviceKind) return null;
	switch (serviceKind) {
		case 'new_chat_members':
			return {
				users: msg.new_chat_members?.map((u) => ({
					id: u.id,
					username: u.username ?? null,
					firstName: u.first_name,
				})),
			};
		case 'left_chat_member':
			return {
				user: {
					id: msg.left_chat_member?.id,
					username: msg.left_chat_member?.username ?? null,
				},
			};
		case 'migrate_to_chat_id':
			return { newChatId: msg.migrate_to_chat_id };
		case 'migrate_from_chat_id':
			return { oldChatId: msg.migrate_from_chat_id };
		case 'pinned_message':
			return { messageId: msg.pinned_message?.message_id };
		default:
			return null;
	}
}

export function normalizeMessage(
	msg: GrammyMessage,
	direction: 'in' | 'out',
	botUserId: number,
): MessageInput {
	const sender = resolveSender(msg);
	const type = classifyMessageType(msg);
	const serviceKind = classifyServiceKind(msg);
	const { media, hasMedia } = extractMedia(msg);

	const allEntities = msg.entities ?? msg.caption_entities;
	const entities = allEntities ? (allEntities as unknown as unknown[]) : null;

	const mentions = extractMentions(allEntities);
	const mentionsBot = mentions.includes(botUserId);

	const serviceData = buildServiceData(serviceKind, msg);

	return {
		chatId: msg.chat.id,
		messageId: msg.message_id,
		direction,
		date: msg.date * 1000,
		fromUserId: sender.fromUserId,
		fromUsername: sender.fromUsername,
		fromDisplayName: sender.fromDisplayName,
		senderChatId: sender.senderChatId,
		isAnonymousAdmin: sender.isAnonymousAdmin,
		viaBotId: msg.via_bot?.id ?? null,
		type,
		serviceKind,
		text: msg.text ?? msg.caption ?? null,
		textPlain: msg.text ?? msg.caption ?? null,
		entities,
		mentions,
		mentionsBot,
		isReplyToBot: msg.reply_to_message?.from?.id === botUserId,
		replyToMessageId: msg.reply_to_message?.message_id ?? null,
		threadId: msg.message_thread_id ?? null,
		mediaGroupId: msg.media_group_id ?? null,
		forwardOrigin: msg.forward_origin
			? (msg.forward_origin as unknown as Record<string, unknown>)
			: null,
		media,
		hasMedia,
		replyMarkup: msg.reply_markup ? (msg.reply_markup as unknown as Record<string, unknown>) : null,
		webAppData: msg.web_app_data
			? { text: msg.web_app_data.data, buttonText: msg.web_app_data.button_text }
			: null,
		linkPreview: msg.link_preview_options
			? (msg.link_preview_options as unknown as Record<string, unknown>)
			: null,
		effectId: msg.effect_id ?? null,
		serviceData,
		editDate: msg.edit_date ? msg.edit_date * 1000 : null,
		isDeleted: false,
		isPinned: false,
		raw: msg as unknown as Record<string, unknown>,
	};
}
