import type { MockBot } from '../lib/mock_grammy.ts';

export async function pinMessage(
	bot: MockBot,
	chatId: number,
	messageId: number,
	disableNotification = false,
): Promise<void> {
	await bot.call('pinChatMessage', {
		chat_id: chatId,
		message_id: messageId,
		disable_notification: disableNotification,
	});
}

export async function unpinMessage(bot: MockBot, chatId: number, messageId: number): Promise<void> {
	await bot.call('unpinChatMessage', { chat_id: chatId, message_id: messageId });
}
