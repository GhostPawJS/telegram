import { strictEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

import * as render from './render.ts';

describe('render surface', () => {
	it('is an object (module namespace)', () => {
		strictEqual(typeof render, 'object');
	});
});
