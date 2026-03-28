// TEMPLATE: This is a calculator-specific read tool.
// Replace with a tool (or tools) for your own domain's read operations.
// Keep the defineCalcTool / ToolResult shape, renaming the prefix to match your package.

import type { OperationRecord } from '../calculations/types.ts';
import type { CalcDb } from '../database.ts';
import * as read from '../read.ts';

import { defineCalcTool, integerSchema, objectSchema } from './tool_metadata.ts';
import { reviewHistoryToolName } from './tool_names.ts';
import type { ToolResult } from './tool_types.ts';
import { toolSuccess, toolWarning } from './tool_types.ts';

export interface ReviewHistoryToolData {
	operations: OperationRecord[];
	total: number;
}

export type ReviewHistoryToolResult = ToolResult<ReviewHistoryToolData>;

export function reviewHistoryToolHandler(
	db: CalcDb,
	input: { limit?: number },
): ReviewHistoryToolResult {
	const operations = read.listHistory(db, { limit: input.limit });
	const warnings =
		operations.length === 0
			? [toolWarning('empty_result', 'No calculations in history yet.')]
			: undefined;
	return toolSuccess(
		`Found ${operations.length} calculation${operations.length === 1 ? '' : 's'}.`,
		{ operations, total: operations.length },
		{
			warnings,
			next:
				operations.length > 0
					? [{ kind: 'use_tool', tool: 'calculate', message: 'Perform another calculation.' }]
					: undefined,
		},
	);
}

export const reviewHistoryTool = defineCalcTool<
	Parameters<typeof reviewHistoryToolHandler>[1],
	ReviewHistoryToolData
>({
	name: reviewHistoryToolName,
	description: 'List recent calculation history, newest first.',
	whenToUse: 'Use this to browse or audit past calculations.',
	whenNotToUse: 'Do not use this to perform a new calculation — use calculate instead.',
	sideEffects: 'none',
	readOnly: true,
	inputDescriptions: {
		limit: 'Maximum number of results to return. Defaults to 50.',
	},
	outputDescription:
		'Ordered list of operation records with operands, operator, result, and timestamp.',
	inputSchema: objectSchema(
		{
			limit: integerSchema('Maximum number of results to return.'),
		},
		[],
		'List calculation history.',
	),
	handler: reviewHistoryToolHandler,
});
