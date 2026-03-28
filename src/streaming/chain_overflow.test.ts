import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { chainOverflow } from './chain_overflow.ts';

describe('chainOverflow', () => {
	it('text fits within maxLength — no overflow', () => {
		const result = chainOverflow('hello world', 20);
		assert.deepEqual(result, { fits: 'hello world', overflow: '' });
	});

	it('exact maxLength boundary — no overflow', () => {
		const text = 'a'.repeat(10);
		const result = chainOverflow(text, 10);
		assert.deepEqual(result, { fits: text, overflow: '' });
	});

	it('splits at last newline before maxLength', () => {
		const text = 'line one\nline two\nline three';
		const result = chainOverflow(text, 18);
		assert.equal(result.fits, 'line one\nline two');
		assert.equal(result.overflow, 'line three');
	});

	it('splits at last space when no newline before maxLength', () => {
		const text = 'hello world foobar';
		const result = chainOverflow(text, 12);
		assert.equal(result.fits, 'hello world');
		assert.equal(result.overflow, 'foobar');
	});

	it('hard-cuts when no boundary found', () => {
		const text = 'abcdefghijklmnop';
		const result = chainOverflow(text, 5);
		assert.equal(result.fits, 'abcde');
		assert.equal(result.overflow, 'fghijklmnop');
	});

	it('prefers newline over space', () => {
		// text: 'hello world\nbye' — maxLength=14 means last newline at idx 11 is within range
		const text = 'hello world\nbye';
		const result = chainOverflow(text, 14);
		assert.equal(result.fits, 'hello world');
		assert.equal(result.overflow, 'bye');
	});
});
