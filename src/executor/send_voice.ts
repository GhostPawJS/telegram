import type { MockBot } from '../lib/mock_grammy.ts';
import { resolveMediaInput } from './media_input.ts';
import type { MediaInput, SendMediaOpts, SentMedia } from './types.ts';

export async function sendVoice(
	bot: MockBot,
	chatId: number,
	voice: MediaInput,
	opts: SendMediaOpts = {},
): Promise<SentMedia> {
	const params: Record<string, unknown> = {
		chat_id: chatId,
		voice: resolveMediaInput(voice),
	};
	if (opts.caption !== undefined) params.caption = opts.caption;
	if (opts.parseMode !== undefined) params.parse_mode = opts.parseMode;
	if (opts.replyToMessageId !== undefined) params.reply_to_message_id = opts.replyToMessageId;
	if (opts.replyMarkup !== undefined) params.reply_markup = opts.replyMarkup;
	const result = (await bot.call('sendVoice', params)) as { message_id: number };
	return { messageId: result.message_id };
}
