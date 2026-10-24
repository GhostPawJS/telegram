import { homedir } from 'node:os';
import { join } from 'node:path';

export function resolveTelegramDbPath(
	options: { flag?: string; env?: Record<string, string | undefined> } = {},
): string {
	return (
		options.flag ??
		((options.env ?? process.env).GHOSTPAW_TELEGRAM_DB ||
			join(homedir(), '.ghostpaw', 'telegram.db'))
	);
}
