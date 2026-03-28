import { tgConnectTool } from './tg_connect_tool.ts';
import { tgManageTool } from './tg_manage_tool.ts';
import { tgReadTool } from './tg_read_tool.ts';
import { tgSendTool } from './tg_send_tool.ts';
import type { ToolDefinitionRegistry } from './tool_metadata.ts';

export const telegramTools: ToolDefinitionRegistry = [
	tgReadTool,
	tgSendTool,
	tgManageTool,
	tgConnectTool,
];

export function listTelegramToolDefinitions() {
	return [...telegramTools];
}

export function getTelegramToolByName(name: string) {
	return telegramTools.find((tool) => tool.name === name) ?? null;
}
