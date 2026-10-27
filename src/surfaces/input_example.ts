import type { JsonSchema } from './surface_types.ts';

export const actionFields: Record<string, string[]> = {
	send_message: ['chatId', 'text'],
	edit_message: ['chatId', 'messageId', 'text'],
	delete_message: ['chatId', 'messageId'],
	pin_message: ['chatId', 'messageId'],
	unpin_message: ['chatId', 'messageId'],
	send_typing: ['chatId'],
	forward_message: ['toChatId', 'fromChatId', 'messageId'],
	ban_user: ['chatId', 'userId'],
	unban_user: ['chatId', 'userId'],
	restrict_user: ['chatId', 'userId', 'canSendMessages'],
	promote_user: ['chatId', 'userId', 'isAdmin'],
	kick_user: ['chatId', 'userId'],
	get_member: ['chatId', 'userId'],
	list_members: ['chatId'],
	get_message: ['chatId', 'messageId'],
	list_messages: ['chatId'],
	search_messages: ['chatId', 'query'],
	get_chat: ['chatId'],
	get_user: ['userId'],
	get_reactions: ['chatId', 'messageId'],
	reply_chain: ['chatId', 'messageId'],
	edit_history: ['chatId', 'messageId'],
};
export function inputExample(schema: JsonSchema, action?: string): unknown {
	if (schema.oneOf) return inputExample(schema.oneOf[0] ?? {});
	if (schema.type === 'object' || schema.properties) {
		const defaultAction =
			schema.properties?.subcommand?.enum?.[0] ?? schema.properties?.action?.enum?.[0];
		if (action === undefined && typeof defaultAction === 'string') action = defaultAction;
		const fields = new Set([
			...(schema.required ?? []),
			...(action ? (actionFields[action] ?? []) : []),
		]);
		return Object.fromEntries(
			[...fields].map((key) => [
				key,
				key === 'subcommand' || key === 'action'
					? (action ?? schema.properties?.[key]?.enum?.[0])
					: inputExample(schema.properties?.[key] ?? {}),
			]),
		);
	}
	if (schema.enum) return schema.enum[0];
	if (schema.type === 'integer' || schema.type === 'number') return 123;
	if (schema.type === 'boolean') return true;
	if (schema.type === 'array') return [];
	return 'example';
}
