import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { escapeMarkdownV2 } from './escape_markdown_v2.ts';

describe('escapeMarkdownV2', () => {
	it('escapes underscore', () => {
		assert.equal(escapeMarkdownV2('_'), '\\_');
	});

	it('escapes asterisk', () => {
		assert.equal(escapeMarkdownV2('*'), '\\*');
	});

	it('escapes dot', () => {
		assert.equal(escapeMarkdownV2('.'), '\\.');
	});

	it('escapes exclamation mark', () => {
		assert.equal(escapeMarkdownV2('!'), '\\!');
	});

	it('escapes open bracket', () => {
		assert.equal(escapeMarkdownV2('['), '\\[');
	});

	it('escapes close bracket', () => {
		assert.equal(escapeMarkdownV2(']'), '\\]');
	});

	it('escapes open paren', () => {
		assert.equal(escapeMarkdownV2('('), '\\(');
	});

	it('escapes close paren', () => {
		assert.equal(escapeMarkdownV2(')'), '\\)');
	});

	it('escapes tilde', () => {
		assert.equal(escapeMarkdownV2('~'), '\\~');
	});

	it('escapes backtick', () => {
		assert.equal(escapeMarkdownV2('`'), '\\`');
	});

	it('escapes greater-than', () => {
		assert.equal(escapeMarkdownV2('>'), '\\>');
	});

	it('escapes hash', () => {
		assert.equal(escapeMarkdownV2('#'), '\\#');
	});

	it('escapes plus', () => {
		assert.equal(escapeMarkdownV2('+'), '\\+');
	});

	it('escapes hyphen', () => {
		assert.equal(escapeMarkdownV2('-'), '\\-');
	});

	it('escapes equals', () => {
		assert.equal(escapeMarkdownV2('='), '\\=');
	});

	it('escapes pipe', () => {
		assert.equal(escapeMarkdownV2('|'), '\\|');
	});

	it('escapes open brace', () => {
		assert.equal(escapeMarkdownV2('{'), '\\{');
	});

	it('escapes close brace', () => {
		assert.equal(escapeMarkdownV2('}'), '\\}');
	});

	it('escapes backslash', () => {
		assert.equal(escapeMarkdownV2('\\'), '\\\\');
	});

	it('escapes combined string with multiple specials', () => {
		assert.equal(escapeMarkdownV2('hello_world.txt!'), 'hello\\_world\\.txt\\!');
	});

	it('does not modify plain text', () => {
		assert.equal(escapeMarkdownV2('hello world'), 'hello world');
	});
});
