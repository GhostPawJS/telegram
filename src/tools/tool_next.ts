// Next-step hint builders — wired in step 7 when tool handlers are implemented.

import type { ToolNextStepHint } from './tool_types.ts';

export function nextUseTool(
	tool: string,
	message: string,
	suggestedInput?: Record<string, unknown>,
): ToolNextStepHint {
	return { kind: 'use_tool', message, tool, suggestedInput };
}

export function nextAskUser(message: string): ToolNextStepHint {
	return { kind: 'ask_user', message };
}

export function nextRetryWith(
	tool: string,
	message: string,
	suggestedInput?: Record<string, unknown>,
): ToolNextStepHint {
	return { kind: 'retry_with', message, tool, suggestedInput };
}

export function nextInspectItem(message: string, tool?: string): ToolNextStepHint {
	return { kind: 'inspect_item', message, tool };
}
