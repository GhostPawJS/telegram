import { getMember, listMembers } from '../members/index.ts';
import { defineTelegramTool, enumSchema, integerSchema, objectSchema } from './tool_metadata.ts';
import { tgManageToolName } from './tool_names.ts';
import { toolFailure, toolNoOp, toolSuccess } from './tool_types.ts';

const MEMBER_STATUS_VALUES = [
	'creator',
	'administrator',
	'member',
	'restricted',
	'left',
	'kicked',
] as const;

type TgManageInput =
	| {
			subcommand: 'ban_user';
			chatId: number;
			userId: number;
			untilDate?: number;
			deleteMessages?: boolean;
	  }
	| { subcommand: 'unban_user'; chatId: number; userId: number }
	| {
			subcommand: 'restrict_user';
			chatId: number;
			userId: number;
			canSendMessages: boolean;
			untilDate?: number;
	  }
	| { subcommand: 'promote_user'; chatId: number; userId: number; isAdmin: boolean }
	| { subcommand: 'kick_user'; chatId: number; userId: number }
	| { subcommand: 'get_member'; chatId: number; userId: number }
	| { subcommand: 'list_members'; chatId: number; status?: string; limit?: number };

export const tgManageTool = defineTelegramTool<TgManageInput, unknown>({
	name: tgManageToolName,
	description:
		'Moderation and chat administration: ban, unban, restrict, promote, kick users, and query member info.',
	whenToUse:
		'Use when you need to moderate users, manage chat permissions, or look up member status.',
	whenNotToUse: 'Do not use for sending messages or reading message history.',
	sideEffects: 'writes_state',
	readOnly: false,
	inputDescriptions: {
		subcommand: 'The moderation action to perform.',
		chatId: 'The chat ID to operate in.',
		userId: 'The user ID to act on.',
		untilDate: 'Unix timestamp until which the action applies (0 = permanent).',
		deleteMessages: 'Whether to delete messages when banning.',
		canSendMessages: 'Whether the user can send messages after restriction.',
		isAdmin: 'Whether to grant or revoke admin status.',
		status: 'Filter members by status.',
		limit: 'Maximum number of members to return.',
	},
	outputDescription: 'An action descriptor ready for the bot harness to execute, or member data.',
	inputSchema: objectSchema(
		{
			subcommand: enumSchema(
				[
					'ban_user',
					'unban_user',
					'restrict_user',
					'promote_user',
					'kick_user',
					'get_member',
					'list_members',
				],
				'The moderation subcommand.',
			),
			chatId: integerSchema('The chat ID.'),
			userId: integerSchema('The user ID.'),
			untilDate: integerSchema('Unix timestamp until the action applies.'),
			deleteMessages: { type: 'boolean', description: 'Delete messages on ban.' },
			canSendMessages: { type: 'boolean', description: 'Whether the user can send messages.' },
			isAdmin: { type: 'boolean', description: 'Grant or revoke admin.' },
			status: enumSchema(MEMBER_STATUS_VALUES, 'Filter by member status.'),
			limit: integerSchema('Max members to return.'),
		},
		['subcommand'],
	),
	handler(db, input) {
		switch (input.subcommand) {
			case 'ban_user': {
				const { chatId, userId, untilDate, deleteMessages } = input;
				const member = getMember(db, chatId, userId);
				if (member === null) {
					return toolFailure(
						'domain',
						'not_found',
						`User ${userId} not found in chat ${chatId}`,
						`User ${userId} not found in chat ${chatId}`,
					);
				}
				return toolSuccess(`Ready to ban user ${userId}`, {
					action: 'ban_user',
					chatId,
					userId,
					untilDate,
					deleteMessages,
				});
			}
			case 'unban_user': {
				const { chatId, userId } = input;
				return toolSuccess(`Ready to unban user ${userId}`, {
					action: 'unban_user',
					chatId,
					userId,
				});
			}
			case 'restrict_user': {
				const { chatId, userId, canSendMessages, untilDate } = input;
				const member = getMember(db, chatId, userId);
				if (member === null) {
					return toolFailure(
						'domain',
						'not_found',
						`User ${userId} not found in chat ${chatId}`,
						`User ${userId} not found in chat ${chatId}`,
					);
				}
				return toolSuccess('Ready to restrict user', {
					action: 'restrict_user',
					chatId,
					userId,
					canSendMessages,
					untilDate,
				});
			}
			case 'promote_user': {
				const { chatId, userId, isAdmin } = input;
				const member = getMember(db, chatId, userId);
				if (member === null) {
					return toolFailure(
						'domain',
						'not_found',
						`User ${userId} not found in chat ${chatId}`,
						`User ${userId} not found in chat ${chatId}`,
					);
				}
				return toolSuccess('Ready to promote user', {
					action: 'promote_user',
					chatId,
					userId,
					isAdmin,
				});
			}
			case 'kick_user': {
				const { chatId, userId } = input;
				const member = getMember(db, chatId, userId);
				if (member === null) {
					return toolFailure(
						'domain',
						'not_found',
						`User ${userId} not found in chat ${chatId}`,
						`User ${userId} not found in chat ${chatId}`,
					);
				}
				return toolSuccess(`Ready to kick user ${userId}`, { action: 'kick_user', chatId, userId });
			}
			case 'get_member': {
				const { chatId, userId } = input;
				const member = getMember(db, chatId, userId);
				if (member === null) {
					return toolFailure(
						'domain',
						'not_found',
						`User ${userId} not found in chat ${chatId}`,
						`User ${userId} not found in chat ${chatId}`,
					);
				}
				return toolSuccess(`Member ${userId} retrieved`, member);
			}
			case 'list_members': {
				const { chatId, status, limit } = input;
				const memberOpts: import('../members/list_members.ts').ListMembersOptions = {
					limit: limit ?? 50,
				};
				if (status !== undefined)
					memberOpts.status = status as import('../members/types.ts').MemberStatus;
				const members = listMembers(db, chatId, memberOpts);
				if (members.length === 0) {
					return toolNoOp('No members found in chat', null);
				}
				return toolSuccess(`${members.length} member(s) retrieved`, members);
			}
		}
	},
});
