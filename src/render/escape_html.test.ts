import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { escapeHtml } from './escape_html.ts';

describe('escapeHtml', () => {
	it('escapes & to &amp;', () => {
		assert.equal(escapeHtml('&'), '&amp;');
	});

	it('escapes < to &lt;', () => {
		assert.equal(escapeHtml('<'), '&lt;');
	});

	it('escapes > to &gt;', () => {
		assert.equal(escapeHtml('>'), '&gt;');
	});

	it('escapes combined: <a href="x&y">', () => {
		assert.equal(escapeHtml('<a href="x&y">'), '&lt;a href="x&amp;y"&gt;');
	});

	it('does not escape plain text', () => {
		assert.equal(escapeHtml('hello world'), 'hello world');
	});

	it('returns empty string for empty input', () => {
		assert.equal(escapeHtml(''), '');
	});

	it('handles multiple occurrences', () => {
		assert.equal(escapeHtml('a & b & c'), 'a &amp; b &amp; c');
	});
});
