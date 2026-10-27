import type { TelegramDb } from '../database.ts';
import { actionFields, inputExample } from '../surfaces/input_example.ts';
import { validateInput } from '../surfaces/validate_input.ts';
import type { ToolResult } from './tool_types.ts';
import { toolFailure } from './tool_types.ts';

export type JsonSchemaType = 'array' | 'boolean' | 'integer' | 'number' | 'object' | 'string';

export interface JsonSchema {
	type?: JsonSchemaType | undefined;
	description?: string | undefined;
	properties?: Record<string, JsonSchema> | undefined;
	required?: string[] | undefined;
	items?: JsonSchema | undefined;
	enum?: readonly (string | number | boolean)[] | undefined;
	oneOf?: readonly JsonSchema[] | undefined;
}

export type ToolSideEffects = 'none' | 'writes_state';
export type ToolInputDescriptions = Record<string, string>;

export interface TelegramToolDefinition<TInput = Record<string, unknown>, TOutput = unknown> {
	name: string;
	description: string;
	whenToUse: string;
	whenNotToUse: string;
	sideEffects: ToolSideEffects;
	readOnly: boolean;
	inputDescriptions: ToolInputDescriptions;
	outputDescription: string;
	inputSchema: JsonSchema;
	handler: {
		bivarianceHack(db: TelegramDb, input: TInput): ToolResult<TOutput>;
	}['bivarianceHack'];
}

// biome-ignore lint/suspicious/noExplicitAny: registry needs to hold heterogeneous tool definitions
export type ToolDefinitionRegistry = readonly TelegramToolDefinition<any, any>[];

export function defineTelegramTool<TInput, TOutput>(
	tool: TelegramToolDefinition<TInput, TOutput>,
): TelegramToolDefinition<TInput, TOutput> {
	const handler = tool.handler;
	return {
		...tool,
		handler(db, input) {
			const record = input as Record<string, unknown>;
			const action = record?.subcommand;
			const schema = {
				...tool.inputSchema,
				required: [
					...(tool.inputSchema.required ?? []),
					...(typeof action === 'string' ? (actionFields[action] ?? []) : []),
				],
			};
			const errors = validateInput(schema, input);
			if (errors.length) {
				const recovery = errors.join('; ');
				const result = toolFailure(
					'domain',
					'invalid_input',
					errors[0] ?? 'Invalid input',
					recovery,
					{ next: [{ kind: 'retry_with', message: recovery }] },
				);
				result.error.recovery = recovery;
				return result;
			}
			const result = handler(db, input);
			if (
				!result.ok &&
				result.outcome === 'error' &&
				result.error.code === 'invalid_input' &&
				!result.error.recovery
			) {
				result.error.recovery = `Inspect ${tool.name} input; pass ${JSON.stringify(inputExample(schema, typeof action === 'string' ? action : undefined))}`;
			}
			return result;
		},
	};
}

export function stringSchema(description: string): JsonSchema {
	return { type: 'string', description };
}
export function numberSchema(description: string): JsonSchema {
	return { type: 'number', description };
}
export function integerSchema(description: string): JsonSchema {
	return { type: 'integer', description };
}
export function booleanSchema(description: string): JsonSchema {
	return { type: 'boolean', description };
}
export function enumSchema(values: readonly string[], description: string): JsonSchema {
	return { type: 'string', enum: values, description };
}
export function objectSchema(
	properties: Record<string, JsonSchema>,
	required: string[] = [],
	description?: string,
): JsonSchema {
	return { type: 'object', properties, required, description };
}
export function arraySchema(items: JsonSchema, description: string): JsonSchema {
	return { type: 'array', items, description };
}
