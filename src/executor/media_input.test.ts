import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { InputFile } from 'grammy';
import { resolveMediaInput } from './media_input.ts';

describe('resolveMediaInput', () => {
	it('passes through string file_id unchanged', () => {
		const result = resolveMediaInput('file_id_abc');
		assert.equal(result, 'file_id_abc');
	});

	it('wraps Buffer in InputFile', () => {
		const buf = Buffer.from('hello');
		const result = resolveMediaInput(buf);
		assert.ok(result instanceof InputFile);
	});

	it('wraps { url } in InputFile', () => {
		const result = resolveMediaInput({ url: 'https://example.com/img.jpg' });
		assert.ok(result instanceof InputFile);
	});
});
