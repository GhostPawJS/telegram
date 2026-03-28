import { strictEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
	calcTools,
	calculateTool,
	defineCalcTool,
	getCalcToolByName,
	listCalcToolDefinitions,
	reviewHistoryTool,
	toolFailure,
	toolSuccess,
} from './index.ts';

describe('tools barrel', () => {
	it('exports all expected symbols', () => {
		strictEqual(typeof defineCalcTool, 'function');
		strictEqual(typeof toolSuccess, 'function');
		strictEqual(typeof toolFailure, 'function');
		strictEqual(typeof getCalcToolByName, 'function');
		strictEqual(typeof listCalcToolDefinitions, 'function');
		strictEqual(Array.isArray(calcTools), true);
		strictEqual(typeof calculateTool.name, 'string');
		strictEqual(typeof reviewHistoryTool.name, 'string');
	});
});
