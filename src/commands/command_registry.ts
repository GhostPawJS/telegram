import { TelegramValidationError } from '../errors.ts';
import type { CommandDef, CommandRegistry } from './types.ts';

export function createCommandRegistry(): CommandRegistry {
	const commands: CommandDef[] = [];

	return {
		register(def: CommandDef): void {
			const key = def.command.toLowerCase();
			const existing = commands.find((c) => c.command.toLowerCase() === key);
			if (existing) {
				throw new TelegramValidationError(`Command '${def.command}' is already registered`);
			}
			commands.push(def);
		},

		get(command: string): CommandDef | null {
			const key = command.toLowerCase();
			return commands.find((c) => c.command.toLowerCase() === key) ?? null;
		},

		list(): CommandDef[] {
			return [...commands];
		},
	};
}
