// TEMPLATE: This is a calculator-specific write tool.
// Replace with a tool (or tools) for your own domain's write operations.
// Keep the defineCalcTool / ToolResult shape, renaming the prefix to match your package.

import { add } from '../calculations/add.ts';
import { divide } from '../calculations/divide.ts';
import { multiply } from '../calculations/multiply.ts';
import { subtract } from '../calculations/subtract.ts';
import type { OperationRecord, Operator } from '../calculations/types.ts';
import { OPERATORS } from '../calculations/types.ts';
import type { CalcDb } from '../database.ts';
import { isCalcError } from '../errors.ts';

import { defineCalcTool, enumSchema, numberSchema, objectSchema } from './tool_metadata.ts';
import { calculateToolName } from './tool_names.ts';
import type { ToolResult } from './tool_types.ts';
import { toolFailure, toolSuccess } from './tool_types.ts';

export interface CalculateToolData {
	operation: OperationRecord;
}

export type CalculateToolResult = ToolResult<CalculateToolData>;

export function calculateToolHandler(
	db: CalcDb,
	input: { a: number; b: number; operator: Operator },
): CalculateToolResult {
	try {
		let operation: OperationRecord;
		switch (input.operator) {
			case '+':
				operation = add(db, input.a, input.b);
				break;
			case '-':
				operation = subtract(db, input.a, input.b);
				break;
			case '*':
				operation = multiply(db, input.a, input.b);
				break;
			case '/':
				operation = divide(db, input.a, input.b);
				break;
		}
		return toolSuccess(
			`${input.a} ${input.operator} ${input.b} = ${operation.result}`,
			{ operation },
			{
				next: [
					{
						kind: 'use_tool',
						tool: 'review_history',
						message: 'View the full calculation history.',
					},
				],
			},
		);
	} catch (error) {
		if (isCalcError(error)) {
			return toolFailure('domain', 'invalid_input', 'Calculation failed.', error.message);
		}
		return toolFailure('system', 'system_error', 'Unexpected error.', String(error));
	}
}

export const calculateTool = defineCalcTool<
	Parameters<typeof calculateToolHandler>[1],
	CalculateToolData
>({
	name: calculateToolName,
	description: 'Perform an arithmetic calculation and persist the result to history.',
	whenToUse: 'Use this to compute a + b, a - b, a * b, or a / b and record it.',
	whenNotToUse: 'Do not use this to browse existing history — use review_history instead.',
	sideEffects: 'writes_state',
	readOnly: false,
	inputDescriptions: {
		a: 'The left-hand operand.',
		b: 'The right-hand operand. Must not be zero when operator is "/".',
		operator: 'The arithmetic operator: +, -, *, or /.',
	},
	outputDescription:
		'The stored operation record with id, operands, operator, result, and timestamp.',
	inputSchema: objectSchema(
		{
			a: numberSchema('The left-hand operand.'),
			b: numberSchema('The right-hand operand.'),
			operator: enumSchema(OPERATORS as unknown as string[], 'The arithmetic operator.'),
		},
		['a', 'b', 'operator'],
		'Perform an arithmetic operation.',
	),
	handler: calculateToolHandler,
});
