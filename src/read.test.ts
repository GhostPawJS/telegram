import { strictEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

import * as read from './read.ts';

describe('read surface', () => {
	it('is an object (module namespace)', () => {
		strictEqual(typeof read, 'object');
	});
});
