import type { MockBot } from '../lib/mock_grammy.ts';

export type ChatAction =
	| 'typing'
	| 'upload_photo'
	| 'record_video'
	| 'upload_video'
	| 'record_voice'
	| 'upload_voice'
	| 'upload_document'
	| 'choose_sticker'
	| 'find_location'
	| 'record_video_note'
	| 'upload_video_note';

export async function sendChatAction(
	bot: MockBot,
	chatId: number,
	action: ChatAction,
	opts: { messageThreadId?: number } = {},
): Promise<void> {
	const params: Record<string, unknown> = { chat_id: chatId, action };
	if (opts.messageThreadId !== undefined) params.message_thread_id = opts.messageThreadId;
	await bot.call('sendChatAction', params);
}
