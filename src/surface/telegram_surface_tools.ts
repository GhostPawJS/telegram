import { createApiClient } from '../bot_api/client.ts';
import type { TelegramDb } from '../database.ts';
import type { SurfaceTool } from '../surfaces/surface_types.ts';
import { createTelegramToolFacade, maskToken } from '../tools/execution.ts';
import { telegramTools } from '../tools/tool_registry.ts';

// One facade per token retains rate limits across calls without exposing credentials.
let activeToken: string | undefined;
let facade: ReturnType<typeof createTelegramToolFacade> | undefined;
export const telegramSurfaceTools: readonly SurfaceTool<TelegramDb>[] = telegramTools.map(
	(tool) => ({
		name: tool.name,
		description: tool.description,
		whenToUse: tool.whenToUse,
		whenNotToUse: tool.whenNotToUse,
		readOnly: tool.readOnly,
		sideEffects: tool.sideEffects,
		inputSchema: { ...tool.inputSchema, type: 'object' },
		async handler(db, input) {
			const token = process.env.TELEGRAM_BOT_TOKEN;
			let result: unknown;
			if (!token || tool.readOnly) result = tool.handler(db, input);
			else {
				if (!facade || activeToken !== token) {
					activeToken = token;
					facade = createTelegramToolFacade({ client: createApiClient(token), execute: true });
				}
				result = await facade.handler(db, tool.name, input);
			}
			const json = JSON.stringify(result);
			return JSON.parse(maskToken(token ? json.replaceAll(token, '[REDACTED]') : json)) as unknown;
		},
	}),
);

const mapping: Record<string, NonNullable<SurfaceTool<TelegramDb>['cli']>> = {
	tg_connect: {
		noun: 'bot',
		verb: 'show',
		action: {
			property: 'subcommand',
			verbs: { get_stats: 'stats', get_state: 'state', list_chats: 'chats' },
			positionals: { get_state: ['key'] },
		},
	},
	tg_read: {
		noun: 'mirror',
		verb: 'show',
		action: {
			property: 'subcommand',
			verbs: {
				get_message: 'message',
				list_messages: 'messages',
				search_messages: 'search',
				get_chat: 'chat',
				list_chats: 'chats',
				get_user: 'user',
				list_users: 'users',
				get_reactions: 'reactions',
				reply_chain: 'replies',
				edit_history: 'edits',
			},
			positionals: {
				get_message: ['chatId', 'messageId'],
				list_messages: ['chatId'],
				search_messages: ['chatId', 'query'],
				get_chat: ['chatId'],
				get_user: ['userId'],
				get_reactions: ['chatId', 'messageId'],
				reply_chain: ['chatId', 'messageId'],
				edit_history: ['chatId', 'messageId'],
			},
		},
	},
	tg_send: {
		noun: 'message',
		verb: 'send',
		action: {
			property: 'subcommand',
			verbs: {
				send_message: 'send',
				edit_message: 'edit',
				delete_message: 'delete',
				pin_message: 'pin',
				unpin_message: 'unpin',
				send_typing: 'typing',
				forward_message: 'forward',
			},
			positionals: {
				send_message: ['chatId', 'text'],
				edit_message: ['chatId', 'messageId', 'text'],
				delete_message: ['chatId', 'messageId'],
				pin_message: ['chatId', 'messageId'],
				unpin_message: ['chatId', 'messageId'],
				send_typing: ['chatId'],
				forward_message: ['fromChatId', 'messageId', 'toChatId'],
			},
		},
	},
	tg_manage: {
		noun: 'member',
		verb: 'show',
		action: {
			property: 'subcommand',
			verbs: {
				ban_user: 'ban',
				unban_user: 'unban',
				restrict_user: 'restrict',
				promote_user: 'promote',
				kick_user: 'kick',
				get_member: 'show',
				list_members: 'list',
			},
			positionals: {
				ban_user: ['chatId', 'userId'],
				unban_user: ['chatId', 'userId'],
				restrict_user: ['chatId', 'userId'],
				promote_user: ['chatId', 'userId'],
				kick_user: ['chatId', 'userId'],
				get_member: ['chatId', 'userId'],
				list_members: ['chatId'],
			},
		},
	},
};

// Noun-verb commands always return plans, including when credentials are present.
export const telegramCliSurfaceTools: readonly SurfaceTool<TelegramDb>[] =
	/* @__PURE__ */ telegramSurfaceTools.map((tool) => ({
		...tool,
		...(mapping[tool.name] ? { cli: mapping[tool.name] } : {}),
		handler: (db, input) => {
			const original = telegramTools.find((candidate) => candidate.name === tool.name);
			if (!original) throw new Error(`Unknown Telegram tool: ${tool.name}`);
			return original.handler(db, input);
		},
	}));
