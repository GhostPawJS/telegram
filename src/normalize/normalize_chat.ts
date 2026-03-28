import type { Chat as GrammyChat } from 'grammy/types';

import type { ChatInput } from '../chats/types.ts';

export function normalizeChat(chat: GrammyChat): ChatInput {
	return {
		chatId: chat.id,
		type: chat.type as ChatInput['type'],
		title: 'title' in chat ? (chat.title ?? null) : null,
		username: 'username' in chat ? (chat.username ?? null) : null,
		firstName: 'first_name' in chat ? (chat.first_name ?? null) : null,
		lastName: 'last_name' in chat ? (chat.last_name ?? null) : null,
		isForum: 'is_forum' in chat ? (chat.is_forum ?? false) : false,
		memberCount: null,
		photoFileId: null,
		isActive: true,
		permissions: null,
		availableReactions: null,
		lastMessageAt: null,
		metadata: {},
	};
}
