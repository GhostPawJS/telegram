import { strictEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { TelegramSkill, TelegramSoul, TelegramToolDefinition, ToolResult } from './types.ts';

describe('types barrel', () => {
	it('TelegramSoul type is importable', () => {
		const soul = {} as TelegramSoul;
		strictEqual(typeof soul, 'object');
	});

	it('TelegramSkill type is importable', () => {
		const skill = {} as TelegramSkill;
		strictEqual(typeof skill, 'object');
	});

	it('TelegramToolDefinition type is importable', () => {
		// biome-ignore lint/suspicious/noExplicitAny: type check only
		const tool = {} as TelegramToolDefinition<any, any>;
		strictEqual(typeof tool, 'object');
	});

	it('ToolResult type is importable', () => {
		const result = {} as ToolResult<unknown>;
		strictEqual(typeof result, 'object');
	});
});
