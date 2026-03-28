import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { StreamBuffer } from './stream_buffer.ts';

describe('StreamBuffer', () => {
	it('starts empty', () => {
		const buf = new StreamBuffer();
		assert.equal(buf.text, '');
		assert.equal(buf.length, 0);
	});

	it('append accumulates text', () => {
		const buf = new StreamBuffer();
		buf.append('hello');
		buf.append(' world');
		assert.equal(buf.text, 'hello world');
		assert.equal(buf.length, 11);
	});

	it('clear resets text', () => {
		const buf = new StreamBuffer();
		buf.append('data');
		buf.clear();
		assert.equal(buf.text, '');
		assert.equal(buf.length, 0);
	});

	it('clone returns current text string', () => {
		const buf = new StreamBuffer();
		buf.append('foo');
		const c = buf.clone();
		buf.append('bar');
		assert.equal(c, 'foo');
		assert.equal(buf.text, 'foobar');
	});

	it('append with empty string leaves text unchanged', () => {
		const buf = new StreamBuffer();
		buf.append('abc');
		buf.append('');
		assert.equal(buf.text, 'abc');
	});
});
