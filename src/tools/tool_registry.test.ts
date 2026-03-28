import { strictEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';
import { calculateToolName, reviewHistoryToolName } from './tool_names.ts';
import { getCalcToolByName, listCalcToolDefinitions } from './tool_registry.ts';

describe('tool registry', () => {
	it('lists all tools', () => {
		const tools = listCalcToolDefinitions();
		strictEqual(tools.length, 2);
	});

	it('finds tools by name', () => {
		strictEqual(getCalcToolByName(calculateToolName)?.name, calculateToolName);
		strictEqual(getCalcToolByName(reviewHistoryToolName)?.name, reviewHistoryToolName);
		strictEqual(getCalcToolByName('nonexistent'), null);
	});
});
