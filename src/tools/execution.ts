import type { TelegramDb } from '../database.ts';
import * as executor from '../executor/index.ts';
import type { ParseMode } from '../executor/types.ts';
import type { MockBot } from '../lib/mock_grammy.ts';
import { translateToolError } from './tool_errors.ts';
import { telegramTools } from './tool_registry.ts';
import { toolSuccess } from './tool_types.ts';

export interface ExecutionOptions {
	client: MockBot;
	execute?: boolean;
	perChatPerSecond?: number;
	globalPerSecond?: number;
	maxRetries?: number;
	now?: () => number;
	sleep?: (ms: number) => Promise<void>;
}

export function maskToken(message: string): string {
	return message.replace(/(\d+):[A-Za-z0-9_-]{30,}/g, '$1:***');
}

/** Creates an async facade; existing synchronous definitions continue to return plans. */
export function createTelegramToolFacade(options: ExecutionOptions) {
	const now = options.now ?? Date.now;
	const sleep =
		options.sleep ?? ((ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms)));
	const chatRate = options.perChatPerSecond ?? 1;
	const globalRate = options.globalPerSecond ?? 30;
	const retries = options.maxRetries ?? 2;
	if (
		![chatRate, globalRate].every((value) => Number.isFinite(value) && value > 0) ||
		!Number.isInteger(retries) ||
		retries < 0
	) {
		throw new Error('Rates must be positive and maxRetries must be a nonnegative integer');
	}
	// Capacity-one token buckets reserve slots synchronously, including concurrent callers.
	let globalSlot = 0;
	const chatSlots = new Map<number, number>();
	const client: MockBot = {
		...options.client,
		call: async (method, ...args) => {
			const params = args[0] as { chat_id: number };
			for (let attempt = 0; ; attempt++) {
				const time = now();
				const slot = Math.max(time, globalSlot, chatSlots.get(params.chat_id) ?? 0);
				globalSlot = slot + 1000 / globalRate;
				chatSlots.set(params.chat_id, slot + 1000 / chatRate);
				if (slot > time) await sleep(slot - time);
				try {
					return await options.client.call(method, ...args);
				} catch (error) {
					const failure = error as {
						error_code?: number;
						parameters?: { retry_after?: number };
					} | null;
					const delay = failure?.parameters?.retry_after;
					if (
						failure?.error_code !== 429 ||
						typeof delay !== 'number' ||
						!Number.isFinite(delay) ||
						delay < 0 ||
						attempt >= retries
					)
						throw error;
					const until = now() + delay * 1000;
					globalSlot = Math.max(globalSlot, until);
					await sleep(delay * 1000);
				}
			}
		},
	};
	return {
		async handler(db: TelegramDb, name: string, input: Record<string, unknown>) {
			try {
				const definition = telegramTools.find((tool) => tool.name === name);
				if (!definition) throw new Error(`Unknown tool: ${name}`);
				const plan = definition.handler(db, input);
				if (
					!options.execute ||
					!['tg_send', 'tg_manage'].includes(name) ||
					!plan.ok ||
					plan.outcome !== 'success'
				)
					return plan;
				const data = plan.data as Record<string, unknown>;
				if (typeof data.action !== 'string') return plan;
				const chat = data.chatId as number;
				const message = data.messageId as number;
				const user = data.userId as number;
				const opts = {
					parseMode: data.parseMode as ParseMode,
					replyToMessageId: data.replyToMessageId as number,
				};
				let sent: unknown;
				switch (data.action) {
					case 'send_message':
						sent = await executor.sendMessage(client, chat, data.text as string, opts);
						break;
					case 'edit_message':
						sent = await executor.editMessage(client, chat, message, data.text as string, opts);
						break;
					case 'delete_message':
						await executor.deleteMessage(client, chat, message);
						break;
					case 'pin_message':
						await executor.pinMessage(client, chat, message);
						break;
					case 'unpin_message':
						await executor.unpinMessage(client, chat, message);
						break;
					case 'send_typing':
						await executor.sendChatAction(client, chat, 'typing');
						break;
					case 'forward_message':
						sent = await executor.forwardMessage(
							client,
							data.toChatId as number,
							data.fromChatId as number,
							message,
						);
						break;
					case 'ban_user':
						await client.call('banChatMember', {
							chat_id: chat,
							user_id: user,
							until_date: data.untilDate,
							revoke_messages: data.deleteMessages,
						});
						break;
					case 'unban_user':
						await client.call('unbanChatMember', { chat_id: chat, user_id: user });
						break;
					case 'restrict_user':
						await client.call('restrictChatMember', {
							chat_id: chat,
							user_id: user,
							permissions: { can_send_messages: data.canSendMessages },
							until_date: data.untilDate,
						});
						break;
					case 'promote_user':
						await client.call('promoteChatMember', {
							chat_id: chat,
							user_id: user,
							can_manage_chat: data.isAdmin,
							can_delete_messages: data.isAdmin,
							can_manage_video_chats: data.isAdmin,
							can_restrict_members: data.isAdmin,
							can_promote_members: data.isAdmin,
							can_change_info: data.isAdmin,
							can_invite_users: data.isAdmin,
							can_post_stories: data.isAdmin,
							can_edit_stories: data.isAdmin,
							can_delete_stories: data.isAdmin,
							can_post_messages: data.isAdmin,
							can_edit_messages: data.isAdmin,
							can_pin_messages: data.isAdmin,
							can_manage_topics: data.isAdmin,
						});
						break;
					case 'kick_user':
						await client.call('banChatMember', { chat_id: chat, user_id: user });
						await client.call('unbanChatMember', { chat_id: chat, user_id: user });
						break;
				}
				return toolSuccess(`Executed ${data.action}`, { ...data, sent });
			} catch (error) {
				return translateToolError(error);
			}
		},
	};
}
