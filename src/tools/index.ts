export { translateToolError, withToolHandling } from './tool_errors.ts';
export type {
	JsonSchema,
	JsonSchemaType,
	TelegramToolDefinition,
	ToolDefinitionRegistry,
	ToolSideEffects,
} from './tool_metadata.ts';
export {
	arraySchema,
	booleanSchema,
	defineTelegramTool,
	enumSchema,
	integerSchema,
	numberSchema,
	objectSchema,
	stringSchema,
} from './tool_metadata.ts';
export {
	tgConnectToolName,
	tgManageToolName,
	tgReadToolName,
	tgSendToolName,
} from './tool_names.ts';
export { nextAskUser, nextInspectItem, nextRetryWith, nextUseTool } from './tool_next.ts';
export type { EntityRef } from './tool_ref.ts';
export { chatRef, messageRef, userRef } from './tool_ref.ts';
export {
	getTelegramToolByName,
	listTelegramToolDefinitions,
	telegramTools,
} from './tool_registry.ts';
export type {
	ToolBaseResult,
	ToolClarificationCode,
	ToolErrorCode,
	ToolErrorKind,
	ToolFailure,
	ToolNeedsClarification,
	ToolNextStepHint,
	ToolNextStepHintKind,
	ToolOutcomeKind,
	ToolResult,
	ToolSuccess,
	ToolWarning,
	ToolWarningCode,
} from './tool_types.ts';
export {
	toolFailure,
	toolNeedsClarification,
	toolNoOp,
	toolSuccess,
	toolWarning,
} from './tool_types.ts';
