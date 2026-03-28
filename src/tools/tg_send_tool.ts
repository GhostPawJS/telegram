import { getMessage } from '../messages/index.ts';
import {
	defineTelegramTool,
	enumSchema,
	integerSchema,
	objectSchema,
	stringSchema,
} from './tool_metadata.ts';
import { tgSendToolName } from './tool_names.ts';
import { toolFailure, toolSuccess } from './tool_types.ts';

type TgSendInput =
	| {
			subcommand: 'send_message';
			chatId: number;
			text: string;
			parseMode?: string;
			replyToMessageId?: number;
	  }
	| {
			subcommand: 'edit_message';
			chatId: number;
			messageId: number;
			text: string;
			parseMode?: string;
	  }
	| { subcommand: 'delete_message'; chatId: number; messageId: number }
	| { subcommand: 'pin_message'; chatId: number; messageId: number }
	| { subcommand: 'unpin_message'; chatId: number; messageId: number }
	| { subcommand: 'send_typing'; chatId: number }
	| { subcommand: 'forward_message'; toChatId: number; fromChatId: number; messageId: number };

export const tgSendTool = defineTelegramTool<TgSendInput, unknown>({
	name: tgSendToolName,
	description:
		'Outbound actions: send, edit, delete, pin/unpin messages, send typing indicator, and forward messages.',
	whenToUse:
		'Use when you need to send or modify messages, show a typing indicator, or forward a message to another chat.',
	whenNotToUse: 'Do not use for reading or querying stored data.',
	sideEffects: 'writes_state',
	readOnly: false,
	inputDescriptions: {
		subcommand: 'The send action to perform.',
		chatId: 'The chat ID to operate in.',
		messageId: 'The message ID to target.',
		text: 'The message text to send or edit.',
		parseMode: 'Parse mode for text formatting (e.g. HTML, MarkdownV2).',
		replyToMessageId: 'Message ID to reply to.',
		toChatId: 'Destination chat ID for forwarding.',
		fromChatId: 'Source chat ID for forwarding.',
	},
	outputDescription: 'An action descriptor ready for the bot harness to execute.',
	inputSchema: objectSchema(
		{
			subcommand: enumSchema(
				[
					'send_message',
					'edit_message',
					'delete_message',
					'pin_message',
					'unpin_message',
					'send_typing',
					'forward_message',
				],
				'The send subcommand.',
			),
			chatId: integerSchema('Chat ID'),
			messageId: integerSchema('Message ID'),
			text: stringSchema('Message text'),
			parseMode: stringSchema('Parse mode (HTML, MarkdownV2)'),
			replyToMessageId: integerSchema('Reply-to message ID'),
			toChatId: integerSchema('Destination chat ID'),
			fromChatId: integerSchema('Source chat ID'),
		},
		['subcommand'],
	),
	handler(db, input) {
		switch (input.subcommand) {
			case 'send_message': {
				const { chatId, text, parseMode, replyToMessageId } = input;
				if (!text || text.trim().length === 0) {
					return toolFailure('domain', 'invalid_input', 'text is required', 'text is required');
				}
				return toolSuccess('Message ready to send', {
					action: 'send_message',
					chatId,
					text,
					parseMode,
					replyToMessageId,
				});
			}
			case 'edit_message': {
				const { chatId, messageId, text, parseMode } = input;
				const msg = getMessage(db, chatId, messageId);
				if (msg === null) {
					return toolFailure(
						'domain',
						'not_found',
						`Message ${messageId} not found in chat ${chatId}`,
						`Message ${messageId} not found in chat ${chatId}`,
					);
				}
				return toolSuccess(`Ready to edit message ${messageId}`, {
					action: 'edit_message',
					chatId,
					messageId,
					text,
					parseMode,
				});
			}
			case 'delete_message': {
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
				return toolSuccess(`Ready to delete message ${messageId}`, {
					action: 'delete_message',
					chatId,
					messageId,
				});
			}
			case 'pin_message': {
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
				return toolSuccess(`Ready to pin message ${messageId}`, {
					action: 'pin_message',
					chatId,
					messageId,
				});
			}
			case 'unpin_message': {
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
				return toolSuccess(`Ready to unpin message ${messageId}`, {
					action: 'unpin_message',
					chatId,
					messageId,
				});
			}
			case 'send_typing': {
				const { chatId } = input;
				return toolSuccess('Typing indicator ready', { action: 'send_typing', chatId });
			}
			case 'forward_message': {
				const { toChatId, fromChatId, messageId } = input;
				return toolSuccess(`Ready to forward message ${messageId}`, {
					action: 'forward_message',
					toChatId,
					fromChatId,
					messageId,
				});
			}
		}
	},
});
