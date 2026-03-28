import type { Update } from 'grammy/types';
import type { BotInfo, PollingOpts } from './types.ts';

export interface PollingContext {
	getUpdates(offset: number, timeout: number, allowedUpdates: string[]): Promise<Update[]>;
	getMe(): Promise<BotInfo>;
	onUpdate(update: Update): Promise<void>;
	onError(err: Error): void;
	signal: AbortSignal;
}

export async function startPolling(ctx: PollingContext, opts: PollingOpts = {}): Promise<BotInfo> {
	const timeout = opts.timeout ?? 30;
	const allowedUpdates = opts.allowedUpdates ?? [];
	const retryDelayMs = opts.retryDelayMs ?? 5000;

	const botInfo = await ctx.getMe();

	let offset = 0;
	// Fire and forget the loop — returns botInfo immediately
	(async () => {
		while (!ctx.signal.aborted) {
			try {
				const updates = await ctx.getUpdates(offset, timeout, allowedUpdates);
				for (const update of updates) {
					if (ctx.signal.aborted) break;
					offset = update.update_id + 1;
					await ctx.onUpdate(update);
				}
			} catch (err) {
				if (ctx.signal.aborted) break;
				ctx.onError(err instanceof Error ? err : new Error(String(err)));
				await new Promise((r) => setTimeout(r, retryDelayMs));
			}
		}
	})();

	return botInfo;
}
