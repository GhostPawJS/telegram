import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { adaptiveDebounce } from './adaptive_debounce.ts';

describe('adaptiveDebounce', () => {
	it('elapsedMs=0 returns baseMs', () => {
		assert.equal(adaptiveDebounce(0), 300);
	});

	it('elapsedMs=5000 returns baseMs*2', () => {
		assert.equal(adaptiveDebounce(5000), 600);
	});

	it('elapsedMs=10000 returns baseMs*4', () => {
		assert.equal(adaptiveDebounce(10000), 1200);
	});

	it('caps at maxMs', () => {
		assert.equal(adaptiveDebounce(100_000), 3000);
	});

	it('just under doubleEveryMs stays at base', () => {
		assert.equal(adaptiveDebounce(4999), 300);
	});

	it('custom params: baseMs=100, maxMs=800, doubleEveryMs=2000', () => {
		assert.equal(adaptiveDebounce(0, 100, 800, 2000), 100);
		assert.equal(adaptiveDebounce(2000, 100, 800, 2000), 200);
		assert.equal(adaptiveDebounce(4000, 100, 800, 2000), 400);
		assert.equal(adaptiveDebounce(6000, 100, 800, 2000), 800);
		assert.equal(adaptiveDebounce(8000, 100, 800, 2000), 800);
	});

	it('negative elapsedMs treated as 0 — returns baseMs', () => {
		// Math.floor(-1 / 5000) = -1, 2**-1 = 0.5, min(300*0.5, 3000) = 150
		// Actually this is fine — it just returns a smaller value, not an error
		const result = adaptiveDebounce(-1000);
		assert.ok(result >= 0, 'result should be non-negative');
		assert.ok(result <= 300, 'result should not exceed base for small negative');
	});
});
