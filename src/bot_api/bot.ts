import type { IncomingMessage, ServerResponse } from 'node:http';
import { setTimeout as delay } from 'node:timers/promises';
import type { CallbackQuery, ChatMemberUpdated, Message, Update, User } from '../telegram_types.ts';
import { type ClientOptions, createApiClient, TelegramApiError } from './client.ts';

type Kind =
	| 'message'
	| 'edited_message'
	| 'callback_query'
	| 'my_chat_member'
	| 'message_reaction'
	| 'message_reaction_count';
type BotContext = {
	message?: Message;
	editedMessage?: Message;
	callbackQuery: CallbackQuery;
	myChatMember: ChatMemberUpdated;
	messageReaction: NonNullable<Update['message_reaction']>;
	messageReactionCount: NonNullable<Update['message_reaction_count']>;
	me: User;
	reply(text: string): Promise<unknown>;
	answerCallbackQuery(params?: { text: string }): Promise<unknown>;
};
type Handler = (ctx: BotContext) => void | Promise<void>;
export class Bot {
	readonly token: string;
	botInfo: (User & Record<string, unknown>) | undefined;
	readonly api: {
		raw: Record<string, (params?: unknown) => Promise<unknown>>;
		config: { use(transform: () => Promise<{ ok: boolean; result: unknown }>): void };
	};
	private readonly client: ReturnType<typeof createApiClient>;
	private handlers = new Map<Kind, Handler[]>();
	private controller: AbortController | undefined;
	constructor(token: string, options: ClientOptions = {}) {
		this.token = token;
		this.client = createApiClient(token, options);
		let transform: (() => Promise<{ ok: boolean; result: unknown }>) | undefined;
		this.api = {
			raw: new Proxy(
				{},
				{
					get: (_, method: string) => (params?: unknown) =>
						transform ? transform().then((r) => r.result) : this.client.call(method, params),
				},
			),
			config: {
				use(fn) {
					transform = fn;
				},
			},
		};
	}
	on(kind: Kind, handler: Handler): this {
		const handlers = this.handlers.get(kind) ?? [];
		handlers.push(handler);
		this.handlers.set(kind, handlers);
		return this;
	}
	async handleUpdate(update: Update): Promise<void> {
		this.botInfo ??= (await this.client.call('getMe')) as User & Record<string, unknown>;
		for (const [kind, handlers] of this.handlers) {
			if (!update[kind]) continue;
			const message = update.message ?? update.edited_message;
			const ctx = {
				message: update.message,
				editedMessage: update.edited_message,
				callbackQuery: update.callback_query,
				myChatMember: update.my_chat_member,
				messageReaction: update.message_reaction,
				messageReactionCount: update.message_reaction_count,
				me: this.botInfo,
				reply: (text: string) => this.call('sendMessage', { chat_id: message?.chat.id, text }),
				answerCallbackQuery: (params?: { text: string }) =>
					this.call('answerCallbackQuery', {
						callback_query_id: update.callback_query?.id,
						...params,
					}),
			} as BotContext;
			for (const handler of handlers) await handler(ctx);
		}
	}
	private call(method: string, params: unknown): Promise<unknown> {
		const fn = this.api.raw[method];
		if (!fn) throw new Error(`Unknown API method: ${method}`);
		return fn(params);
	}
	async start(): Promise<void> {
		if (this.controller) throw new Error('Bot is already running');
		const controller = new AbortController();
		this.controller = controller;
		try {
			this.botInfo ??= (await this.client.call('getMe', {}, controller.signal)) as User &
				Record<string, unknown>;
			await this.client.call('deleteWebhook', {}, controller.signal);
			let offset = 0;
			while (!controller.signal.aborted) {
				let updates: Update[];
				try {
					updates = (await this.client.call(
						'getUpdates',
						{ offset, timeout: 30, allowed_updates: [...this.handlers.keys()] },
						controller.signal,
					)) as Update[];
				} catch (error) {
					if (controller.signal.aborted) break;
					if (
						error instanceof TelegramApiError &&
						error.error_code !== 429 &&
						error.error_code < 500
					)
						throw error;
					const seconds =
						error instanceof TelegramApiError ? (error.parameters.retry_after ?? 3) : 3;
					await delay(seconds * 1000, undefined, { signal: controller.signal });
					continue;
				}
				for (const update of updates) {
					if (controller.signal.aborted) break;
					await this.handleUpdate(update);
					offset = update.update_id + 1;
				}
			}
		} catch (error) {
			if (!controller.signal.aborted) throw error;
		} finally {
			this.controller = undefined;
		}
	}
	stop(): void {
		this.controller?.abort();
	}
}
export function webhookCallback(
	bot: Bot,
	_adapter: 'http',
	options: { secretToken?: string } = {},
) {
	return async (req: IncomingMessage, res: ServerResponse): Promise<void> => {
		if (
			options.secretToken !== undefined &&
			req.headers['x-telegram-bot-api-secret-token'] !== options.secretToken
		) {
			res.writeHead(401).end();
			return;
		}
		try {
			const chunks: Buffer[] = [];
			for await (const chunk of req) chunks.push(Buffer.from(chunk));
			const update = JSON.parse(Buffer.concat(chunks).toString()) as Update;
			await bot.handleUpdate(update);
			res.writeHead(200).end();
		} catch {
			res.writeHead(500).end();
		}
	};
}
