import { strictEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

import * as read from './read.ts';

describe('read barrel', () => {
	it('exports all expected query functions', () => {
		strictEqual(typeof read.listHistory, 'function');
		strictEqual(typeof read.getLastResult, 'function');
	});
});
