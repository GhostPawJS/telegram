import { type ClientOptions, createApiClient } from '../bot_api/client.ts';
import { containsInputFile } from '../bot_api/input_file.ts';
import type { MockBot } from './mock_grammy.ts';

export interface AdaptableBot {
	token: string;
	api: { raw: object };
}

/**
 * Wraps a grammy Bot into the MockBot interface expected by all write/streaming
 * executor functions. Call this once and pass the result wherever a bot is needed.
 *
 * @example
 * const grammy = new Bot(token);
 * const bot = adaptBot(grammy);
 * await write.sendMessage(bot, chatId, 'Hello');
 */
export function adaptBot(grammy: AdaptableBot, options: ClientOptions = {}): MockBot {
	const uploads = createApiClient(grammy.token, options);
	const raw = grammy.api.raw as unknown as Record<string, (payload: unknown) => Promise<unknown>>;

	const call = async (method: string, ...args: unknown[]): Promise<unknown> => {
		if (containsInputFile(args[0])) return uploads.call(method, ...args);
		const fn = raw[method];
		if (!fn) throw new Error(`Unknown grammy API method: ${method}`);
		return fn.call(grammy.api.raw, args[0]);
	};

	return {
		token: grammy.token,
		api: new Proxy({} as Record<string, (...args: unknown[]) => Promise<unknown>>, {
			get:
				(_, method: string) =>
				(...args: unknown[]) =>
					call(method, ...args),
		}),
		call,
	};
}
