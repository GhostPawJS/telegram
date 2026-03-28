import type { CommandResult } from './types.ts';

/**
 * Parses a Telegram command from message text.
 * Handles /command, /command@botname, /command arg1 arg2.
 * Returns null if text is not a command.
 */
export function parseCommand(text: string, botUsername?: string): CommandResult | null {
	if (!text.startsWith('/')) return null;

	// Remove the leading slash
	const withoutSlash = text.slice(1);
	if (!withoutSlash) return null;

	// Split on whitespace to get the command part and remaining args
	const parts = withoutSlash.split(/\s+/);
	const commandPart = parts[0];
	if (!commandPart) return null;

	// Check for @botname in the command
	const atIndex = commandPart.indexOf('@');
	let commandName: string;
	if (atIndex !== -1) {
		commandName = commandPart.slice(0, atIndex);
		const mentionedBot = commandPart.slice(atIndex + 1);
		// If botUsername is provided, only match if names match (case-insensitive)
		if (botUsername !== undefined && mentionedBot.toLowerCase() !== botUsername.toLowerCase()) {
			return null;
		}
	} else {
		commandName = commandPart;
	}

	if (!commandName) return null;

	const args = parts.slice(1).filter((a) => a.length > 0);

	return {
		command: commandName.toLowerCase(),
		args,
		rawText: text,
	};
}
