import type { MockBot } from '../lib/mock_grammy.ts';
import { sendMessage } from './send_message.ts';
import type { BroadcastOpts, BroadcastResult, SendOpts } from './types.ts';

export async function broadcast(
	bot: MockBot,
	chatIds: number[],
	text: string,
	opts: SendOpts & BroadcastOpts = {},
): Promise<BroadcastResult> {
	const delayMs = opts.delayMs ?? 50;
	const result: BroadcastResult = { sent: 0, failed: 0, errors: [] };
	for (const chatId of chatIds) {
		try {
			await sendMessage(bot, chatId, text, opts);
			result.sent++;
		} catch (err) {
			result.failed++;
			const error = err instanceof Error ? err.message : String(err);
			result.errors.push({ chatId, error });
			opts.onError?.(chatId, err instanceof Error ? err : new Error(error));
		}
		if (delayMs > 0) await new Promise((r) => setTimeout(r, delayMs));
	}
	return result;
}
