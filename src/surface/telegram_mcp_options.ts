import type { TelegramDb } from '../database.ts';
import type { McpServerOptions } from '../surfaces/mcp_server.ts';
import { telegramVersion } from '../version.ts';
import { telegramMcpInstructions } from './telegram_mcp_instructions.ts';
import { telegramSurfaceTools } from './telegram_surface_tools.ts';

export function telegramMcpOptions(
	context: () => TelegramDb | Promise<TelegramDb>,
): McpServerOptions<TelegramDb> {
	return {
		name: 'ghostpaw-telegram',
		version: telegramVersion,
		title: 'Telegram',
		instructions: telegramMcpInstructions,
		tools: telegramSurfaceTools,
		context,
		annotations: (tool) => ({
			readOnlyHint: tool.readOnly ?? false,
			destructiveHint: !tool.readOnly,
			idempotentHint: tool.readOnly ?? false,
			openWorldHint: !tool.readOnly,
		}),
	};
}
