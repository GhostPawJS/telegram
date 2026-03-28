import { strictEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { getTelegramToolByName, listTelegramToolDefinitions } from './tool_registry.ts';

describe('tool registry', () => {
	it('lists all tools (empty until step 7)', () => {
		const tools = listTelegramToolDefinitions();
		strictEqual(Array.isArray(tools), true);
	});

	it('returns null for unknown tool name', () => {
		strictEqual(getTelegramToolByName('nonexistent'), null);
	});
});
