import { getChat, listChats } from '../chats/index.ts';
import {
	editHistory,
	getMessage,
	listMessages,
	replyChain,
	searchMessages,
} from '../messages/index.ts';
import { getReactions } from '../reactions/index.ts';
import { getUser, listUsers } from '../users/index.ts';
import {
	defineTelegramTool,
	enumSchema,
	integerSchema,
	objectSchema,
	stringSchema,
} from './tool_metadata.ts';
import { tgReadToolName } from './tool_names.ts';
import { toolFailure, toolNoOp, toolSuccess } from './tool_types.ts';

type TgReadInput =
	| { subcommand: 'get_message'; chatId: number; messageId: number }
	| {
			subcommand: 'list_messages';
			chatId: number;
			limit?: number;
			before?: number;
			after?: number;
			threadId?: number;
	  }
	| { subcommand: 'search_messages'; chatId: number; query: string; limit?: number }
	| { subcommand: 'get_chat'; chatId: number }
	| { subcommand: 'list_chats'; limit?: number }
	| { subcommand: 'get_user'; userId: number }
	| { subcommand: 'list_users'; limit?: number }
	| { subcommand: 'get_reactions'; chatId: number; messageId: number }
	| { subcommand: 'reply_chain'; chatId: number; messageId: number }
	| { subcommand: 'edit_history'; chatId: number; messageId: number };

export const tgReadTool = defineTelegramTool<TgReadInput, unknown>({
	name: tgReadToolName,
	description: 'Read and query the Telegram database: messages, chats, users, reactions, and more.',
	whenToUse:
		'Use when you need to inspect stored messages, find chats or users, search text, or retrieve reaction and edit history.',
	whenNotToUse: 'Do not use for sending, editing, or deleting messages.',
	sideEffects: 'none',
	readOnly: true,
	inputDescriptions: {
		subcommand: 'Which read operation to perform.',
		chatId: 'The chat ID to query.',
		messageId: 'The message ID to retrieve.',
		userId: 'The user ID to retrieve.',
		query: 'Full-text search query.',
		limit: 'Maximum number of results to return.',
		before: 'Return messages before this timestamp (ms).',
		after: 'Return messages after this timestamp (ms).',
		threadId: 'Filter messages by thread ID.',
	},
	outputDescription: 'The requested data from the database.',
	inputSchema: objectSchema(
		{
			subcommand: enumSchema(
				[
					'get_message',
					'list_messages',
					'search_messages',
					'get_chat',
					'list_chats',
					'get_user',
					'list_users',
					'get_reactions',
					'reply_chain',
					'edit_history',
				],
				'Which read operation to perform',
			),
			chatId: integerSchema('Chat ID'),
			messageId: integerSchema('Message ID'),
			userId: integerSchema('User ID'),
			query: stringSchema('Full-text search query'),
			limit: integerSchema('Max results'),
			before: integerSchema('Before this timestamp (ms)'),
			after: integerSchema('After this timestamp (ms)'),
			threadId: integerSchema('Thread ID filter'),
		},
		['subcommand'],
	),
	handler(db, input) {
		switch (input.subcommand) {
			case 'get_message': {
				const { chatId, messageId } = input;
				const msg = getMessage(db, chatId, messageId);
				if (msg === null) {
					return toolFailure(
						'domain',
						'not_found',
						`Message ${messageId} not found in chat ${chatId}`,
						`Message ${messageId} not found in chat ${chatId}`,
					);
				}
				return toolSuccess(`Message ${messageId} retrieved`, msg);
			}
			case 'list_messages': {
				const { chatId, limit, before, after, threadId } = input;
				const query: {
					chatId: number;
					limit: number;
					before?: number;
					after?: number;
					threadId?: number;
				} = {
					chatId,
					limit: limit ?? 20,
				};
				if (before !== undefined) query.before = before;
				if (after !== undefined) query.after = after;
				if (threadId !== undefined) query.threadId = threadId;
				const msgs = listMessages(db, query);
				if (msgs.length === 0) {
					return toolNoOp('No messages found', null);
				}
				return toolSuccess(`${msgs.length} message(s) retrieved`, msgs);
			}
			case 'search_messages': {
				const { chatId, query, limit } = input;
				const results = searchMessages(db, chatId, query, { limit: limit ?? 10 });
				if (results.length === 0) {
					return toolNoOp('No messages matched the search query', null);
				}
				return toolSuccess(`${results.length} result(s) found`, results);
			}
			case 'get_chat': {
				const { chatId } = input;
				const chat = getChat(db, chatId);
				if (chat === null) {
					return toolFailure(
						'domain',
						'not_found',
						`Chat ${chatId} not found`,
						`Chat ${chatId} not found`,
					);
				}
				return toolSuccess(`Chat ${chatId} retrieved`, chat);
			}
			case 'list_chats': {
				const { limit } = input;
				const chats = listChats(db, { limit: limit ?? 20 });
				if (chats.length === 0) {
					return toolNoOp('No chats found', null);
				}
				return toolSuccess(`${chats.length} chat(s) retrieved`, chats);
			}
			case 'get_user': {
				const { userId } = input;
				const user = getUser(db, userId);
				if (user === null) {
					return toolFailure(
						'domain',
						'not_found',
						`User ${userId} not found`,
						`User ${userId} not found`,
					);
				}
				return toolSuccess(`User ${userId} retrieved`, user);
			}
			case 'list_users': {
				const { limit } = input;
				const users = listUsers(db, { limit: limit ?? 20 });
				if (users.length === 0) {
					return toolNoOp('No users found', null);
				}
				return toolSuccess(`${users.length} user(s) retrieved`, users);
			}
			case 'get_reactions': {
				const { chatId, messageId } = input;
				const reactions = getReactions(db, chatId, messageId);
				return toolSuccess(`${reactions.length} reaction(s) retrieved`, reactions);
			}
			case 'reply_chain': {
				const { chatId, messageId } = input;
				const chain = replyChain(db, chatId, messageId);
				if (chain.length === 0) {
					return toolNoOp('No reply chain found', null);
				}
				return toolSuccess(`Reply chain of ${chain.length} message(s) retrieved`, chain);
			}
			case 'edit_history': {
				const { chatId, messageId } = input;
				const edits = editHistory(db, chatId, messageId);
				if (edits.length === 0) {
					return toolNoOp('No edit history found', null);
				}
				return toolSuccess(`${edits.length} edit(s) found`, edits);
			}
		}
	},
});
