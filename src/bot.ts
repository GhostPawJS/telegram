import { Bot, webhookCallback } from './bot_api/bot.ts';
import type { ClientOptions } from './bot_api/client.ts';
import { incrementStat } from './bot_state/index.ts';
import { insertCallback } from './callbacks/index.ts';
import { getChat, upsertChat } from './chats/index.ts';
import type { TelegramDb } from './database.ts';
import { DEFAULTS } from './defaults.ts';
import { downloadFile } from './executor/download_file.ts';
import { upsertFile } from './files/index.ts';
import { adaptBot } from './lib/adapt_bot.ts';
import { loadHttp } from './lib/lazy_dependencies.ts';
import type { MockBot } from './lib/mock_grammy.ts';
import { upsertMember } from './members/index.ts';
import { applyEdit, insertMessage } from './messages/index.ts';
import { extractDownloadableFiles } from './normalize/extract_downloadable_files.ts';
import { normalizeChat } from './normalize/normalize_chat.ts';
import { normalizeMember } from './normalize/normalize_member.ts';
import { normalizeMessage } from './normalize/normalize_message.ts';
import { normalizeUser } from './normalize/normalize_user.ts';
import type {
	CallbackHandler,
	EditedMessageHandler,
	JoinRequestHandler,
	MemberUpdateHandler,
	MessageHandler,
	PollAnswerHandler,
	ReactionHandler,
} from './normalize/types.ts';
import { applyReactionCounts, applyReactionUpdate } from './reactions/index.ts';
import type { Message } from './telegram_types.ts';
import { upsertUser } from './users/index.ts';
import { withTransaction } from './with_transaction.ts';

export interface WebhookConfig {
	path: string;
	port: number;
	secretToken?: string;
}

export interface BotConfig {
	api?: ClientOptions;
	allowedChatIds?: readonly number[];
	token: string;
	db: TelegramDb;
	webhook?: WebhookConfig;
	onMessage?: MessageHandler;
	onEditedMessage?: EditedMessageHandler;
	onCallback?: CallbackHandler;
	onMemberUpdate?: MemberUpdateHandler;
	onReaction?: ReactionHandler;
	onPollAnswer?: PollAnswerHandler;
	onJoinRequest?: JoinRequestHandler;
}

export type { MockBot };

export interface TelegramBot {
	readonly config: BotConfig;
	readonly client: MockBot;
	start(): Promise<void>;
	stop(): void;
}

export function createBot(config: BotConfig): TelegramBot {
	const { db } = config;
	const grammy = new Bot(config.token, config.api);
	const transport = adaptBot(grammy, config.api);
	const call: MockBot['call'] = async (method, ...args) => {
		const result = await transport.call(method, ...args);
		if (/^(send|forward)/.test(method)) {
			for (const value of Array.isArray(result) ? result : [result]) {
				const msg = value as Message | null;
				if (!msg?.chat || typeof msg.message_id !== 'number' || typeof msg.date !== 'number')
					continue;
				// Mirroring must never turn a delivered send into a failed call.
				try {
					withTransaction(db, () => {
						upsertChat(db, normalizeChat(msg.chat));
						insertMessage(db, normalizeMessage(msg, 'out', grammy.botInfo?.id ?? 0));
						incrementStat(db, 'messages_out');
					});
				} catch {
					// ignore persistence errors for outgoing mirrors
				}
			}
		}
		return result;
	};
	const client: MockBot = {
		token: transport.token,
		call,
		api: new Proxy(transport.api, {
			get:
				(_, method: string) =>
				(...args: unknown[]) =>
					call(method, ...args),
		}),
	};
	const allowed = config.allowedChatIds ?? DEFAULTS.allowedChatIds;
	const accepts = (id: number | undefined) =>
		id === undefined || allowed.length === 0 || allowed.includes(id);

	grammy.on('message', async (ctx) => {
		const msg = ctx.message;
		if (!msg || !accepts(msg.chat.id)) return;

		// All DB writes for a single update are atomic.
		const { user, chat, stored } = withTransaction(db, () => {
			const user = msg.from ? upsertUser(db, normalizeUser(msg.from)) : null;
			const chat = upsertChat(db, normalizeChat(msg.chat));
			const stored = insertMessage(db, normalizeMessage(msg, 'in', ctx.me.id));
			incrementStat(db, 'messages_in');
			return { user, chat, stored };
		});

		// Eagerly download all files in background — fire and forget.
		// Errors are swallowed; checksum stays null and can be retried later.
		for (const f of extractDownloadableFiles(msg)) {
			upsertFile(db, { ...f, chatId: msg.chat.id, messageId: msg.message_id, checksum: null });
			downloadFile(client, db, f.fileId).catch(() => {});
		}

		await config.onMessage?.({
			message: stored,
			user,
			chat,
			reply: (text) =>
				client.call('sendMessage', { chat_id: msg.chat.id, text }).then(() => undefined),
		});
	});

	grammy.on('edited_message', async (ctx) => {
		const msg = ctx.editedMessage;
		if (!msg || !accepts(msg.chat.id)) return;
		const user = msg.from ? upsertUser(db, normalizeUser(msg.from)) : null;
		const chat = getChat(db, msg.chat.id);
		try {
			const updated = applyEdit(db, msg.chat.id, msg.message_id, {
				editDate: msg.edit_date ? msg.edit_date * 1000 : null,
				text: msg.text ?? msg.caption ?? null,
			});
			incrementStat(db, 'edits');
			await config.onEditedMessage?.({
				message: updated,
				user,
				chat,
				reply: (text) =>
					client.call('sendMessage', { chat_id: msg.chat.id, text }).then(() => undefined),
			});
		} catch {
			// message not persisted yet — ignore
		}
	});

	grammy.on('callback_query', async (ctx) => {
		const cq = ctx.callbackQuery;
		if (!accepts(cq.message?.chat.id)) return;
		const user = upsertUser(db, normalizeUser(cq.from));
		const chatId = cq.message?.chat.id ?? 0;
		const chat = chatId ? getChat(db, chatId) : null;
		const entry = insertCallback(db, {
			callbackId: cq.id,
			chatId,
			messageId: cq.message?.message_id ?? 0,
			userId: cq.from.id,
			data: cq.data ?? null,
			handler: null,
			payload: null,
			answeredAt: null,
			expiresAt: null,
		});
		incrementStat(db, 'callbacks');
		await config.onCallback?.({
			callback: entry,
			user,
			chat,
			answer: (text) =>
				text !== undefined
					? ctx.answerCallbackQuery({ text }).then(() => undefined)
					: ctx.answerCallbackQuery().then(() => undefined),
		});
	});

	grammy.on('my_chat_member', async (ctx) => {
		const update = ctx.myChatMember;
		if (!accepts(update.chat.id)) return;
		upsertUser(db, normalizeUser(update.from));
		upsertChat(db, normalizeChat(update.chat));
		const member = upsertMember(db, normalizeMember(update.chat.id, update.new_chat_member));
		const oldMember = normalizeMember(update.chat.id, update.old_chat_member);
		await config.onMemberUpdate?.({ chatId: update.chat.id, member, oldMember });
	});

	grammy.on('message_reaction', async (ctx) => {
		const reaction = ctx.messageReaction;
		if (!accepts(reaction.chat.id)) return;
		const toEmoji = (r: {
			type: string;
			emoji?: string | undefined;
			custom_emoji_id?: string | undefined;
		}) =>
			r.type === 'emoji'
				? (r.emoji ?? '')
				: r.type === 'custom_emoji'
					? (r.custom_emoji_id ?? '')
					: 'paid';
		const oldEmojis = (reaction.old_reaction ?? []).map(toEmoji);
		const newEmojis = (reaction.new_reaction ?? []).map(toEmoji);
		const u = reaction.user;
		const displayName = u ? `${u.first_name}${u.last_name ? ` ${u.last_name}` : ''}` : 'Unknown';
		applyReactionUpdate(
			db,
			reaction.chat.id,
			reaction.message_id,
			u?.id ?? 0,
			displayName,
			oldEmojis,
			newEmojis,
		);
		incrementStat(db, 'reactions');
		await config.onReaction?.({
			chatId: reaction.chat.id,
			messageId: reaction.message_id,
			userId: u?.id ?? 0,
			oldReactions: oldEmojis,
			newReactions: newEmojis,
		});
	});

	grammy.on('message_reaction_count', (ctx) => {
		const update = ctx.messageReactionCount;
		if (!accepts(update.chat.id)) return;
		const toEmoji = (r: {
			type: string;
			emoji?: string | undefined;
			custom_emoji_id?: string | undefined;
		}) =>
			r.type === 'emoji'
				? (r.emoji ?? '')
				: r.type === 'custom_emoji'
					? (r.custom_emoji_id ?? '')
					: 'paid';
		const counts = (update.reactions ?? []).map((r) => ({
			emoji: toEmoji(r.type),
			emojiType: r.type.type as 'emoji' | 'custom_emoji' | 'paid',
			count: r.total_count,
		}));
		applyReactionCounts(db, update.chat.id, update.message_id, counts);
	});

	if (config.webhook) {
		const webhookCfg = config.webhook;
		const webhookOpts: { secretToken?: string } = {};
		if (webhookCfg.secretToken !== undefined) {
			webhookOpts.secretToken = webhookCfg.secretToken;
		}
		const handleUpdate = webhookCallback(grammy, 'http', webhookOpts);
		const server = loadHttp().createServer((req, res) => {
			if (req.url !== webhookCfg.path) {
				res.writeHead(404).end();
				return;
			}
			if (webhookCfg.secretToken !== undefined) {
				const header = req.headers['x-telegram-bot-api-secret-token'];
				if (header !== webhookCfg.secretToken) {
					res.writeHead(401).end();
					return;
				}
			}
			handleUpdate(req, res);
		});
		return {
			config,
			client,
			start: () =>
				new Promise<void>((resolve) => {
					server.listen(webhookCfg.port, () => resolve());
				}),
			stop: () => {
				server.close();
			},
		};
	}

	return {
		config,
		client,
		start: () => grammy.start(),
		stop: () => grammy.stop(),
	};
}
