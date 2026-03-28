import type { MockBot } from '../lib/mock_grammy.ts';
import type { SendOpts, SentMessage } from './types.ts';

export async function sendMessage(
	bot: MockBot,
	chatId: number,
	text: string,
	opts: SendOpts = {},
): Promise<SentMessage> {
	const params: Record<string, unknown> = { chat_id: chatId, text };
	if (opts.parseMode) params.parse_mode = opts.parseMode;
	if (opts.replyMarkup !== undefined) params.reply_markup = opts.replyMarkup;
	if (opts.replyToMessageId !== undefined) params.reply_to_message_id = opts.replyToMessageId;
	if (opts.disablePreview) params.disable_web_page_preview = true;
	if (opts.disableNotification) params.disable_notification = true;
	if (opts.protectContent) params.protect_content = true;
	if (opts.messageThreadId !== undefined) params.message_thread_id = opts.messageThreadId;
	const result = (await bot.call('sendMessage', params)) as {
		message_id: number;
		chat: { id: number };
		date: number;
	};
	return { chatId: result.chat.id, messageId: result.message_id, date: result.date };
}
