import type { TelegramDb } from './database.ts';
import { openTelegramDb } from './surface/open_telegram_db.ts';
import { resolveTelegramDbPath } from './surface/resolve_telegram_db_path.ts';
import { telegramMcpOptions } from './surface/telegram_mcp_options.ts';
import { createMcpServer } from './surfaces/mcp_server.ts';

export { serveTelegramMcp } from './surface/serve_telegram_mcp.ts';
export { telegramMcpInstructions } from './surface/telegram_mcp_instructions.ts';
export type { McpServerOptions } from './surfaces/mcp_server.ts';
export {
	createMcpServer,
	MCP_LATEST_PROTOCOL_VERSION,
	MCP_SUPPORTED_PROTOCOL_VERSIONS,
} from './surfaces/mcp_server.ts';
export { serveMcpStdio } from './surfaces/mcp_stdio.ts';
export type * from './surfaces/surface_types.ts';

export function createTelegramMcpServer(options: { db?: TelegramDb; dbPath?: string } = {}) {
	return createMcpServer(
		telegramMcpOptions(
			() =>
				options.db ??
				openTelegramDb(
					resolveTelegramDbPath(options.dbPath === undefined ? {} : { flag: options.dbPath }),
				),
		),
	);
}
