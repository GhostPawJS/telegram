import { strictEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createBot } from './bot.ts';

describe('createBot', () => {
	it('is a function', () => {
		strictEqual(typeof createBot, 'function');
	});
});
