import { getState, getStats } from '../bot_state/index.ts';
import { listChats } from '../chats/index.ts';
import {
	defineTelegramTool,
	enumSchema,
	integerSchema,
	objectSchema,
	stringSchema,
} from './tool_metadata.ts';
import { tgConnectToolName } from './tool_names.ts';
import { toolNoOp, toolSuccess } from './tool_types.ts';

type TgConnectInput =
	| { subcommand: 'get_stats' }
	| { subcommand: 'get_state'; key: string }
	| { subcommand: 'list_chats'; limit?: number };

export const tgConnectTool = defineTelegramTool<TgConnectInput, unknown>({
	name: tgConnectToolName,
	description: 'Query bot connection status, configuration, and chat list.',
	whenToUse: 'Use to retrieve bot statistics, stored state values, or a list of active chats.',
	whenNotToUse: 'Do not use for sending messages or moderating users.',
	sideEffects: 'none',
	readOnly: true,
	inputDescriptions: {
		subcommand: 'The query to perform.',
		key: 'State key to retrieve.',
		limit: 'Maximum number of chats to return.',
	},
	outputDescription: 'Bot stats, a state value, or a list of chats.',
	inputSchema: objectSchema(
		{
			subcommand: enumSchema(['get_stats', 'get_state', 'list_chats'], 'The connect subcommand.'),
			key: stringSchema('The state key to look up.'),
			limit: integerSchema('Max chats to return.'),
		},
		['subcommand'],
	),
	handler(db, input) {
		switch (input.subcommand) {
			case 'get_stats': {
				const stats = getStats(db);
				return toolSuccess('Bot stats retrieved', stats);
			}
			case 'get_state': {
				const { key } = input;
				const value = getState(db, key);
				if (value === null) {
					return toolNoOp(`No state stored for key: ${key}`, null);
				}
				return toolSuccess(`State for ${key} retrieved`, { key, value });
			}
			case 'list_chats': {
				const { limit } = input;
				const chats = listChats(db, { limit: limit ?? 20 });
				if (chats.length === 0) {
					return toolNoOp('No chats found', null);
				}
				return toolSuccess(`${chats.length} chat(s) retrieved`, chats);
			}
		}
	},
});
