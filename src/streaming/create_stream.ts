import type { MockBot } from '../lib/mock_grammy.ts';
import { chainOverflow } from './chain_overflow.ts';
import { StreamBuffer } from './stream_buffer.ts';
import type { StreamHandle, StreamOpts } from './types.ts';

interface SendResult {
	message_id: number;
}

function isSendResult(v: unknown): v is { result: SendResult } {
	return (
		typeof v === 'object' &&
		v !== null &&
		'result' in v &&
		typeof (v as { result: unknown }).result === 'object' &&
		(v as { result: unknown }).result !== null &&
		'message_id' in (v as { result: Record<string, unknown> }).result
	);
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
				await bot.call('editMessageText', opts.chatId, currentMessageId, sendText, {
					parse_mode: opts.parseMode,
				});
				lastFlushedText = sendText;
			} else {
				const result = await bot.call('sendMessage', opts.chatId, sendText, {
					parse_mode: opts.parseMode,
				});
				lastFlushedText = sendText;
				if (isSendResult(result)) {
					currentMessageId = result.result.message_id;
				}
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

		get text(): string {
			return buffer.text;
		},

		get done(): boolean {
			return isDone;
		},
	};
}
