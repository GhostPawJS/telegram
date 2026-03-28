import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { markdownToMarkdownV2 } from './markdown_to_markdown_v2.ts';

describe('markdownToMarkdownV2', () => {
	it('converts **bold** to *bold*', () => {
		assert.equal(markdownToMarkdownV2('**bold**'), '*bold*');
	});

	it('converts *italic* to _italic_', () => {
		assert.equal(markdownToMarkdownV2('*italic*'), '_italic_');
	});

	it('converts `code` to `code`', () => {
		assert.equal(markdownToMarkdownV2('`code`'), '`code`');
	});

	it('converts [text](url) to [text](url)', () => {
		assert.equal(markdownToMarkdownV2('[text](url)'), '[text](url)');
	});

	it('escapes special chars in plain text', () => {
		const result = markdownToMarkdownV2('hello. world!');
		assert.ok(result.includes('\\.'));
		assert.ok(result.includes('\\!'));
	});

	it('converts ~~del~~ to ~del~', () => {
		assert.equal(markdownToMarkdownV2('~~del~~'), '~del~');
	});

	it('converts # Heading to *Heading*', () => {
		assert.equal(markdownToMarkdownV2('# Heading'), '*Heading*');
	});

	it('converts > blockquote', () => {
		const result = markdownToMarkdownV2('> quote');
		assert.ok(result.startsWith('>'));
		assert.ok(result.includes('quote'));
	});

	it('does not escape text inside code spans', () => {
		const result = markdownToMarkdownV2('`a.b!c`');
		assert.equal(result, '`a.b!c`');
	});
});
