import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { splitCaption } from './split_caption.ts';

describe('splitCaption', () => {
	it('default maxLength is 1024 (splits 1025-char string)', () => {
		const text = 'a'.repeat(1025);
		const result = splitCaption(text);
		assert.equal(result.length, 2);
		assert.equal((result[0] ?? '').length, 1024);
		assert.equal((result[1] ?? '').length, 1);
	});

	it('does not split text at exactly 1024 chars', () => {
		const text = 'a'.repeat(1024);
		const result = splitCaption(text);
		assert.equal(result.length, 1);
	});

	it('returns [text] for short text', () => {
		assert.deepEqual(splitCaption('short'), ['short']);
	});

	it('custom maxLength overrides default', () => {
		const text = 'hello world';
		const result = splitCaption(text, 5);
		for (const chunk of result) {
			assert.ok(chunk.length <= 5, `chunk too long: ${chunk.length}`);
		}
	});

	it('delegates correctly to splitText logic (splits at word boundary)', () => {
		const word1 = 'a'.repeat(500);
		const word2 = 'b'.repeat(525);
		const text = `${word1} ${word2}`;
		// total = 1026, over default 1024
		const result = splitCaption(text);
		assert.equal(result.length, 2);
		assert.equal(result[0] ?? '', word1);
		assert.equal(result[1] ?? '', word2);
	});
});
