import { TelegramFileError } from '../errors.ts';
import type { MockBot } from '../lib/mock_grammy.ts';
import { containsInputFile, InputFile } from './input_file.ts';

export interface ClientOptions {
	fetch?: typeof fetch;
	apiRoot?: string;
	allowPrivateMediaUrls?: boolean;
	mediaMaxBytes?: number;
	mediaTimeoutMs?: number;
}
export class TelegramApiError extends Error {
	readonly error_code: number;
	readonly description: string;
	readonly parameters: { retry_after?: number; migrate_to_chat_id?: number };
	constructor(method: string, code: number, description: string, parameters = {}) {
		super(`Call to '${method}' failed! (${code}: ${description})`);
		this.name = 'TelegramApiError';
		this.error_code = code;
		this.description = description;
		this.parameters = parameters;
	}
}
export function createApiClient(token: string, options: ClientOptions = {}): MockBot {
	const fetcher =
		options.fetch ?? ((...args: Parameters<typeof fetch>) => globalThis.fetch(...args));
	const root = (options.apiRoot ?? 'https://api.telegram.org').replace(/\/$/, '');
	const mask = (text: string) => text.replaceAll(token, '[REDACTED]');
	async function request(
		method: string,
		params: unknown = {},
		signal?: AbortSignal,
	): Promise<unknown> {
		try {
			let body: string | FormData;
			const headers: Record<string, string> = {};
			if (containsInputFile(params)) {
				const form = new FormData();
				let index = 0;
				async function serialize(value: unknown): Promise<unknown> {
					if (value instanceof InputFile) {
						const key = `file${index++}`;
						form.append(
							key,
							await value.toBlob(fetcher, {
								allowPrivate:
									options.allowPrivateMediaUrls === true ||
									process.env.GHOSTPAW_TELEGRAM_ALLOW_PRIVATE_URLS === '1',
								...(options.mediaMaxBytes !== undefined ? { maxBytes: options.mediaMaxBytes } : {}),
								...(options.mediaTimeoutMs !== undefined
									? { timeoutMs: options.mediaTimeoutMs }
									: {}),
							}),
							value.filename ?? 'file',
						);
						return `attach://${key}`;
					}
					if (Array.isArray(value)) return Promise.all(value.map(serialize));
					if (value !== null && typeof value === 'object') {
						const entries = await Promise.all(
							Object.entries(value).map(async ([k, v]) => [k, await serialize(v)]),
						);
						return Object.fromEntries(entries);
					}
					return value;
				}
				const serialized = (await serialize(params)) as Record<string, unknown>;
				for (const [key, value] of Object.entries(serialized)) {
					if (value !== undefined)
						form.append(key, typeof value === 'string' ? value : JSON.stringify(value));
				}
				body = form;
			} else {
				body = JSON.stringify(params);
				headers['content-type'] = 'application/json';
			}
			const response = await fetcher(`${root}/bot${token}/${method}`, {
				method: 'POST',
				headers,
				body,
				...(signal ? { signal } : {}),
			});
			const result = (await response.json()) as {
				ok: boolean;
				result?: unknown;
				error_code?: number;
				description?: string;
				parameters?: { retry_after?: number };
			};
			if (!result.ok)
				throw new TelegramApiError(
					mask(method),
					result.error_code ?? response.status,
					mask(result.description ?? response.statusText),
					result.parameters,
				);
			return result.result;
		} catch (error) {
			if (error instanceof TelegramApiError) throw error;
			if (error instanceof TelegramFileError) throw new TelegramFileError(mask(error.message));
			throw new Error(mask(error instanceof Error ? error.message : String(error)));
		}
	}
	const call = (method: string, ...args: unknown[]) =>
		request(method, args[0], args[1] as AbortSignal | undefined);
	return {
		token,
		call,
		api: new Proxy({} as MockBot['api'], {
			get:
				(_, method: string) =>
				(...args: unknown[]) =>
					call(method, ...args),
		}),
	};
}
