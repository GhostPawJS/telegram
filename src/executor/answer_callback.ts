import type { MockBot } from '../lib/mock_grammy.ts';

export async function answerCallback(
	bot: MockBot,
	callbackQueryId: string,
	opts: { text?: string; showAlert?: boolean; url?: string; cacheTime?: number } = {},
): Promise<void> {
	const params: Record<string, unknown> = { callback_query_id: callbackQueryId };
	if (opts.text !== undefined) params.text = opts.text;
	if (opts.showAlert) params.show_alert = true;
	if (opts.url !== undefined) params.url = opts.url;
	if (opts.cacheTime !== undefined) params.cache_time = opts.cacheTime;
	await bot.call('answerCallbackQuery', params);
}
