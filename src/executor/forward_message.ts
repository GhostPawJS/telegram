import type { MockBot } from '../lib/mock_grammy.ts';
import type { SentMessage } from './types.ts';

export async function forwardMessage(
	bot: MockBot,
	toChatId: number,
	fromChatId: number,
	messageId: number,
	opts: { disableNotification?: boolean; protectContent?: boolean } = {},
): Promise<SentMessage> {
	const params: Record<string, unknown> = {
		chat_id: toChatId,
		from_chat_id: fromChatId,
		message_id: messageId,
	};
	if (opts.disableNotification) params.disable_notification = true;
	if (opts.protectContent) params.protect_content = true;
	const result = (await bot.call('forwardMessage', params)) as {
		message_id: number;
		chat: { id: number };
		date: number;
	};
	return { chatId: result.chat.id, messageId: result.message_id, date: result.date };
}
