import type { MockBot } from '../lib/mock_grammy.ts';
import { chainOverflow } from './chain_overflow.ts';
import { StreamBuffer } from './stream_buffer.ts';
import type { StreamHandle, StreamOpts } from './types.ts';

/** Extract message_id from a grammy raw sendMessage response */
function extractMessageId(v: unknown): number | undefined {
	if (typeof v !== 'object' || v === null) return undefined;
	// grammy raw returns the object directly: { message_id, chat, ... }
	const direct = v as Record<string, unknown>;
	if (typeof direct.message_id === 'number') return direct.message_id;
	// fallback: some mocks wrap in { result: { message_id } }
	const wrapped = direct.result;
	if (typeof wrapped === 'object' && wrapped !== null) {
		const id = (wrapped as Record<string, unknown>).message_id;
		if (typeof id === 'number') return id;
	}
	return undefined;
}

export function createStream(bot: MockBot, opts: StreamOpts): StreamHandle {
	const buffer = new StreamBuffer();
	const maxLength = opts.maxLength ?? 4096;
	const debounceMs = opts.debounceMs ?? 300;

	let currentMessageId: number | undefined = opts.messageId;
	let pendingTimer: ReturnType<typeof setTimeout> | undefined;
	let isDone = false;
	let lastFlushedText = '';

	async function flush(): Promise<void> {
		const text = buffer.text;
		if (text === lastFlushedText) return;

		try {
			const { fits, overflow } = chainOverflow(text, maxLength);
			const sendText = overflow ? fits : text;

			if (currentMessageId !== undefined) {
				const params: Record<string, unknown> = {
					chat_id: opts.chatId,
					message_id: currentMessageId,
					text: sendText,
				};
				if (opts.parseMode !== undefined) params.parse_mode = opts.parseMode;
				await bot.call('editMessageText', params);
				lastFlushedText = sendText;
			} else {
				const params: Record<string, unknown> = {
					chat_id: opts.chatId,
					text: sendText,
				};
				if (opts.parseMode !== undefined) params.parse_mode = opts.parseMode;
				const result = await bot.call('sendMessage', params);
				lastFlushedText = sendText;
				const mid = extractMessageId(result);
				if (mid !== undefined) currentMessageId = mid;
			}

			if (overflow) {
				const overflowOpts: StreamOpts = {
					chatId: opts.chatId,
					maxLength,
					debounceMs: 0,
					...(opts.parseMode !== undefined && { parseMode: opts.parseMode }),
					...(opts.onError !== undefined && { onError: opts.onError }),
				};
				const overflowHandle = createStream(bot, overflowOpts);
				overflowHandle.write(overflow);
				await overflowHandle.end();
			}
		} catch (err) {
			if (opts.onError) {
				opts.onError(err instanceof Error ? err : new Error(String(err)));
			} else {
				throw err;
			}
		}
	}

	function scheduleFlush(): void {
		if (pendingTimer !== undefined) {
			clearTimeout(pendingTimer);
		}
		pendingTimer = setTimeout(() => {
			pendingTimer = undefined;
			flush().catch(() => {});
		}, debounceMs);
	}

	return {
		write(chunk: string): void {
			buffer.append(chunk);
			scheduleFlush();
		},

		async end(): Promise<void> {
			if (pendingTimer !== undefined) {
				clearTimeout(pendingTimer);
				pendingTimer = undefined;
			}
			await flush();
			isDone = true;
		},

		async append(chunk: string): Promise<void> {
			buffer.append(chunk);
			if (pendingTimer !== undefined) {
				clearTimeout(pendingTimer);
				pendingTimer = undefined;
			}
			await flush();
		},

		async replace(text: string): Promise<void> {
			buffer.reset(text);
			if (pendingTimer !== undefined) {
				clearTimeout(pendingTimer);
				pendingTimer = undefined;
			}
			await flush();
		},

		get text(): string {
			return buffer.text;
		},

		get done(): boolean {
			return isDone;
		},
	};
}
