import { calculateTool } from './calculate_tool.ts';
import { reviewHistoryTool } from './review_history_tool.ts';
import type { ToolDefinitionRegistry } from './tool_metadata.ts';

export const calcTools = [calculateTool, reviewHistoryTool] satisfies ToolDefinitionRegistry;

export function listCalcToolDefinitions() {
	return [...calcTools];
}

export function getCalcToolByName(name: string) {
	return calcTools.find((tool) => tool.name === name) ?? null;
}
