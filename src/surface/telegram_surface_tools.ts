import { createApiClient } from '../bot_api/client.ts';
import type { TelegramDb } from '../database.ts';
import type { SurfaceTool } from '../surfaces/surface_types.ts';
import { createTelegramToolFacade, maskToken } from '../tools/execution.ts';
import { telegramTools } from '../tools/tool_registry.ts';

// One facade per token retains rate limits across calls without exposing credentials.
let activeToken: string | undefined;
let facade: ReturnType<typeof createTelegramToolFacade> | undefined;
export const telegramSurfaceTools: readonly SurfaceTool<TelegramDb>[] = telegramTools.map(
	(tool) => ({
		name: tool.name,
		description: tool.description,
		whenToUse: tool.whenToUse,
		whenNotToUse: tool.whenNotToUse,
		readOnly: tool.readOnly,
		sideEffects: tool.sideEffects,
		inputSchema: { ...tool.inputSchema, type: 'object' },
		async handler(db, input) {
			const token = process.env.TELEGRAM_BOT_TOKEN;
			if (!token || tool.readOnly) {
				const result = JSON.stringify(tool.handler(db, input));
				return JSON.parse(
					maskToken(token ? result.replaceAll(token, '[REDACTED]') : result),
				) as unknown;
			}
			if (!facade || activeToken !== token) {
				activeToken = token;
				facade = createTelegramToolFacade({ client: createApiClient(token), execute: true });
			}
			const result = await facade.handler(db, tool.name, input);
			return JSON.parse(
				maskToken(JSON.stringify(result).replaceAll(token, '[REDACTED]')),
			) as unknown;
		},
	}),
);
