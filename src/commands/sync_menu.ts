import type { Bot } from 'grammy';
import type { CommandDef, CommandRegistry, CommandScope } from './types.ts';

/**
 * Syncs the bot's command menu with Telegram using setMyCommands.
 * Groups commands by scope and calls setMyCommands for each scope.
 */
export async function syncMenu(
	bot: Bot,
	registry: CommandRegistry,
	defaultScope?: CommandScope,
): Promise<void> {
	const defs = registry.list();
	const groups = new Map<CommandScope, CommandDef[]>();

	for (const def of defs) {
		const scope: CommandScope = def.scope ?? defaultScope ?? 'default';
		const group = groups.get(scope);
		if (group) {
			group.push(def);
		} else {
			groups.set(scope, [def]);
		}
	}

	for (const [scope, scopeDefs] of groups) {
		const commands = scopeDefs.map((def) => ({
			command: def.command,
			description: def.description,
		}));
		await bot.api.setMyCommands(commands, { scope: { type: scope } });
	}
}
