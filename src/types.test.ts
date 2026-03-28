import { strictEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { OPERATORS } from './types.ts';

describe('types barrel', () => {
	it('re-exports OPERATORS from calculations', () => {
		strictEqual(Array.isArray(OPERATORS), true);
		strictEqual(OPERATORS.length, 4);
	});
});
