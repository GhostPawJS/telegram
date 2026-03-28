import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { splitText } from './split_text.ts';

describe('splitText', () => {
	it('returns [text] for short text', () => {
		assert.deepEqual(splitText('hello'), ['hello']);
	});

	it('returns [text] for text exactly at maxLength', () => {
		const text = 'a'.repeat(4096);
		const result = splitText(text);
		assert.equal(result.length, 1);
		assert.equal(result[0] ?? '', text);
	});

	it('splits at word boundary when 1 char over', () => {
		const word1 = 'a'.repeat(2040);
		const word2 = 'b'.repeat(2057);
		const text = `${word1} ${word2}`;
		// text.length = 2040 + 1 + 2057 = 4098, over 4096
		const result = splitText(text);
		assert.equal(result.length, 2);
		assert.equal(result[0] ?? '', word1);
		assert.equal(result[1] ?? '', word2);
		for (const chunk of result) {
			assert.ok(chunk.length <= 4096);
		}
	});

	it('splits at paragraph boundary (double newline)', () => {
		// Use 2048 + \n\n + 2048 = 4098 total > 4096
		const p1 = 'a'.repeat(2048);
		const p2 = 'b'.repeat(2048);
		const text = `${p1}\n\n${p2}`;
		const result = splitText(text);
		assert.equal(result.length, 2);
		assert.equal(result[0] ?? '', p1);
		assert.equal(result[1] ?? '', p2);
	});

	it('splits at line boundary (single newline)', () => {
		// 2048 + \n + 2048 = 4097 total > 4096, no \n\n present
		const line1 = 'a'.repeat(2048);
		const line2 = 'b'.repeat(2048);
		const text = `${line1}\n${line2}`;
		const result = splitText(text);
		assert.equal(result.length, 2);
		assert.equal(result[0] ?? '', line1);
		assert.equal(result[1] ?? '', line2);
	});

	it('hard splits when no natural boundary exists', () => {
		const text = 'a'.repeat(4097);
		const result = splitText(text);
		assert.equal(result.length, 2);
		assert.equal((result[0] ?? '').length, 4096);
		assert.equal((result[1] ?? '').length, 1);
	});

	it('ensures each chunk does not exceed maxLength', () => {
		const text = Array.from({ length: 10 }, (_, i) => `Para ${i}: ${'x'.repeat(500)}`).join('\n\n');
		const result = splitText(text);
		for (const chunk of result) {
			assert.ok(chunk.length <= 4096, `chunk too long: ${chunk.length}`);
		}
	});

	it('works with custom maxLength', () => {
		const text = 'hello world foo bar';
		const result = splitText(text, 10);
		for (const chunk of result) {
			assert.ok(chunk.length <= 10, `chunk too long: ${chunk.length}`);
		}
	});

	it('trims whitespace from chunks and filters empty strings', () => {
		const text = '  hello  \n\n  world  ';
		const result = splitText(text, 4096);
		assert.equal(result.length, 1);
		// The whole text fits in one chunk, trimmed
		assert.ok(!(result[0] ?? '').startsWith(' '));
		assert.ok(!(result[0] ?? '').endsWith(' '));
	});
});
