import type { Message } from 'grammy/types';

export interface SenderInfo {
	fromUserId: number | null;
	fromUsername: string | null;
	fromDisplayName: string;
	senderChatId: number | null;
	isAnonymousAdmin: boolean;
}

export function resolveSender(msg: Message): SenderInfo {
	let fromUserId: number | null = null;
	let fromUsername: string | null = null;
	let fromDisplayName = 'Unknown';
	let senderChatId: number | null = null;
	let isAnonymousAdmin = false;

	if (msg.from) {
		fromUserId = msg.from.id;
		fromUsername = msg.from.username ?? null;
		fromDisplayName = msg.from.last_name
			? `${msg.from.first_name} ${msg.from.last_name}`
			: msg.from.first_name;
	}

	if (msg.sender_chat) {
		senderChatId = msg.sender_chat.id;
		isAnonymousAdmin = true;
	}

	return {
		fromUserId,
		fromUsername,
		fromDisplayName,
		senderChatId,
		isAnonymousAdmin,
	};
}
