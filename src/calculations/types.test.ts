import { strictEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { OPERATORS } from './types.ts';

describe('types', () => {
	it('exports the four arithmetic operators', () => {
		strictEqual(OPERATORS.includes('+'), true);
		strictEqual(OPERATORS.includes('-'), true);
		strictEqual(OPERATORS.includes('*'), true);
		strictEqual(OPERATORS.includes('/'), true);
		strictEqual(OPERATORS.length, 4);
	});
});
