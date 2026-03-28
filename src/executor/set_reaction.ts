import type { MockBot } from '../lib/mock_grammy.ts';

export async function setReaction(
	bot: MockBot,
	chatId: number,
	messageId: number,
	reactions: Array<
		{ type: 'emoji'; emoji: string } | { type: 'custom_emoji'; custom_emoji_id: string }
	>,
	isBig?: boolean,
): Promise<void> {
	const params: Record<string, unknown> = {
		chat_id: chatId,
		message_id: messageId,
		reaction: reactions,
	};
	if (isBig) params.is_big = true;
	await bot.call('setMessageReaction', params);
}
