import { strictEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

import * as network from './network.ts';

describe('network surface', () => {
	it('is an object (module namespace)', () => {
		strictEqual(typeof network, 'object');
	});
});
