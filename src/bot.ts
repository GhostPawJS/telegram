import * as http from 'node:http';
import type { WebhookOptions } from 'grammy';
import { Bot, webhookCallback } from 'grammy';

import { incrementStat } from './bot_state/index.ts';
import { insertCallback } from './callbacks/index.ts';
import { getChat, upsertChat } from './chats/index.ts';
import type { TelegramDb } from './database.ts';
import { downloadFile } from './executor/download_file.ts';
import { upsertFile } from './files/index.ts';
import { adaptBot } from './lib/adapt_bot.ts';
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
import { upsertUser } from './users/index.ts';
import { withTransaction } from './with_transaction.ts';

export interface WebhookConfig {
	path: string;
	port: number;
	secretToken?: string;
}

export interface BotConfig {
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
	const grammy = new Bot(config.token);
	const client = adaptBot(grammy);

	grammy.on('message', async (ctx) => {
		const msg = ctx.message;
		if (!msg) return;

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
			reply: (text) => ctx.reply(text).then(() => undefined),
		});
	});

	grammy.on('edited_message', async (ctx) => {
		const msg = ctx.editedMessage;
		if (!msg) return;
		const user = msg.from ? upsertUser(db, normalizeUser(msg.from)) : null;
		const chat = getChat(db, msg.chat.id);
		try {
			const updated = applyEdit(db, msg.chat.id, msg.message_id, {
				editDate: msg.edit_date ? msg.edit_date * 1000 : null,
				text: msg.text ?? null,
			});
			incrementStat(db, 'edits');
			await config.onEditedMessage?.({
				message: updated,
				user,
				chat,
				reply: (text) => ctx.reply(text).then(() => undefined),
			});
		} catch {
			// message not persisted yet — ignore
		}
	});

	grammy.on('callback_query', async (ctx) => {
		const cq = ctx.callbackQuery;
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
		upsertUser(db, normalizeUser(update.from));
		upsertChat(db, normalizeChat(update.chat));
		const member = upsertMember(db, normalizeMember(update.chat.id, update.new_chat_member));
		const oldMember = normalizeMember(update.chat.id, update.old_chat_member);
		await config.onMemberUpdate?.({ chatId: update.chat.id, member, oldMember });
	});

	grammy.on('message_reaction', async (ctx) => {
		const reaction = ctx.messageReaction;
		const toEmoji = (r: { type: string; emoji?: string; custom_emoji_id?: string }) =>
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
		const toEmoji = (r: { type: string; emoji?: string; custom_emoji_id?: string }) =>
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
		const webhookOpts: WebhookOptions = {};
		if (webhookCfg.secretToken !== undefined) {
			webhookOpts.secretToken = webhookCfg.secretToken;
		}
		const handleUpdate = webhookCallback(grammy, 'http', webhookOpts);
		const server = http.createServer((req, res) => {
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
