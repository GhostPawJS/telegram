import type { Context } from 'grammy';
import { parseCommand } from './parse_command.ts';
import type { CommandMiddleware, CommandRegistry } from './types.ts';

/**
 * Creates grammy middleware that routes /commands to registered handlers.
 * Extracts command from ctx.message.text, looks up in registry, calls action.
 * Calls next() if no matching command is found.
 */
export function createCommandMiddleware(
	registry: CommandRegistry,
	botUsername?: string,
): CommandMiddleware {
	return async (ctx: Context, next: () => Promise<void>): Promise<void> => {
		const text = ctx.message?.text;
		if (!text) return next();
		const parsed = parseCommand(text, botUsername);
		if (!parsed) return next();
		const def = registry.get(parsed.command);
		if (!def) return next();
		await def.action({
			command: parsed.command,
			args: parsed.args,
			rawText: parsed.rawText,
			chatId: ctx.chat?.id ?? 0,
			userId: ctx.from?.id ?? null,
			messageId: ctx.message?.message_id ?? 0,
		});
	};
}
