import { strictEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
	defineTelegramTool,
	getTelegramToolByName,
	listTelegramToolDefinitions,
	telegramTools,
	toolFailure,
	toolSuccess,
} from './index.ts';

describe('tools barrel', () => {
	it('exports all expected symbols', () => {
		strictEqual(typeof defineTelegramTool, 'function');
		strictEqual(typeof toolSuccess, 'function');
		strictEqual(typeof toolFailure, 'function');
		strictEqual(typeof getTelegramToolByName, 'function');
		strictEqual(typeof listTelegramToolDefinitions, 'function');
		strictEqual(Array.isArray(telegramTools), true);
	});
});
