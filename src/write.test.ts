import { strictEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

import * as write from './write.ts';

describe('write surface', () => {
	it('is an object (module namespace)', () => {
		strictEqual(typeof write, 'object');
	});
});
