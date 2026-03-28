import { strictEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
	add,
	clearHistory,
	divide,
	getLastResult,
	initCalculationTables,
	listHistory,
	multiply,
	OPERATORS,
	subtract,
} from './index.ts';

describe('calculations barrel', () => {
	it('exports all expected symbols', () => {
		strictEqual(typeof add, 'function');
		strictEqual(typeof subtract, 'function');
		strictEqual(typeof multiply, 'function');
		strictEqual(typeof divide, 'function');
		strictEqual(typeof clearHistory, 'function');
		strictEqual(typeof listHistory, 'function');
		strictEqual(typeof getLastResult, 'function');
		strictEqual(typeof initCalculationTables, 'function');
		strictEqual(Array.isArray(OPERATORS), true);
	});
});
