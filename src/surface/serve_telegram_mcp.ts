import type { TelegramDb } from '../database.ts';
import { createMcpServer } from '../surfaces/mcp_server.ts';
import { serveMcpStdio } from '../surfaces/mcp_stdio.ts';
import { openTelegramDb } from './open_telegram_db.ts';
import { resolveTelegramDbPath } from './resolve_telegram_db_path.ts';
import { telegramMcpOptions } from './telegram_mcp_options.ts';

export async function serveTelegramMcp(
	options: { db?: TelegramDb; dbPath?: string } = {},
): Promise<void> {
	let owned: TelegramDb | undefined;
	const server = createMcpServer(
		telegramMcpOptions(async () => {
			if (options.db) return options.db;
			owned = await openTelegramDb(
				resolveTelegramDbPath(options.dbPath === undefined ? {} : { flag: options.dbPath }),
			);
			return owned;
		}),
	);
	try {
		await serveMcpStdio(server);
	} finally {
		owned?.close();
	}
}
