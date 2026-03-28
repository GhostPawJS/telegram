import type { MockBot } from '../lib/mock_grammy.ts';

export async function deleteMessage(
	bot: MockBot,
	chatId: number,
	messageId: number,
): Promise<void> {
	await bot.call('deleteMessage', { chat_id: chatId, message_id: messageId });
}
