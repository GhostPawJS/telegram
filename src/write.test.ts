import { strictEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

import * as write from './write.ts';

describe('write barrel', () => {
	it('exports all expected mutation functions', () => {
		strictEqual(typeof write.add, 'function');
		strictEqual(typeof write.subtract, 'function');
		strictEqual(typeof write.multiply, 'function');
		strictEqual(typeof write.divide, 'function');
		strictEqual(typeof write.clearHistory, 'function');
	});
});
