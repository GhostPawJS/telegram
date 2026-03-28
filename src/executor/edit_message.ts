import type { MockBot } from '../lib/mock_grammy.ts';
import type { EditOpts, SentMessage } from './types.ts';

export async function editMessage(
	bot: MockBot,
	chatId: number,
	messageId: number,
	text: string,
	opts: EditOpts = {},
): Promise<SentMessage> {
	const params: Record<string, unknown> = { chat_id: chatId, message_id: messageId, text };
	if (opts.parseMode) params.parse_mode = opts.parseMode;
	if (opts.replyMarkup !== undefined) params.reply_markup = opts.replyMarkup;
	if (opts.disablePreview) params.disable_web_page_preview = true;
	const result = (await bot.call('editMessageText', params)) as {
		message_id: number;
		chat: { id: number };
		date: number;
	};
	return { chatId: result.chat.id, messageId: result.message_id, date: result.date };
}
