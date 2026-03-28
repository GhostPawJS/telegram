import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { markdownToHtml } from './markdown_to_html.ts';

describe('markdownToHtml', () => {
	it('converts **bold** to <b>', () => {
		assert.equal(markdownToHtml('**bold**'), '<b>bold</b>');
	});

	it('converts *italic* to <i>', () => {
		assert.equal(markdownToHtml('*italic*'), '<i>italic</i>');
	});

	it('converts ~~del~~ to <s>', () => {
		assert.equal(markdownToHtml('~~del~~'), '<s>del</s>');
	});

	it('converts `code` to <code>', () => {
		assert.equal(markdownToHtml('`code`'), '<code>code</code>');
	});

	it('converts fenced code block with lang to <pre><code class="language-...">', () => {
		const result = markdownToHtml('```js\nconsole.log("hi")\n```');
		assert.ok(result.includes('<pre><code class="language-js">'));
		assert.ok(result.includes('console.log'));
		assert.ok(result.includes('</code></pre>'));
	});

	it('converts fenced code block without lang to <pre>', () => {
		const result = markdownToHtml('```\nsome code\n```');
		assert.ok(result.startsWith('<pre>'));
		assert.ok(result.includes('some code'));
		assert.ok(!result.includes('<code class='));
	});

	it('converts [text](url) to <a href="url">', () => {
		assert.equal(markdownToHtml('[text](url)'), '<a href="url">text</a>');
	});

	it('converts > quote to <blockquote>', () => {
		const result = markdownToHtml('> quote');
		assert.ok(result.includes('<blockquote>'));
		assert.ok(result.includes('quote'));
		assert.ok(result.includes('</blockquote>'));
	});

	it('converts # Heading to <b>', () => {
		assert.equal(markdownToHtml('# Heading'), '<b>Heading</b>');
	});

	it('escapes HTML special chars in plain text', () => {
		assert.equal(markdownToHtml('Hello <world> & stuff'), 'Hello &lt;world&gt; &amp; stuff');
	});

	it('passes through plain text', () => {
		assert.equal(markdownToHtml('just plain text'), 'just plain text');
	});

	it('handles nested formatting in link text', () => {
		const result = markdownToHtml('[**bold link**](https://example.com)');
		assert.ok(result.includes('<a href="https://example.com">'));
		assert.ok(result.includes('<b>bold link</b>'));
	});

	it('escapes special chars in code blocks', () => {
		const result = markdownToHtml('`a < b && c > d`');
		assert.ok(result.includes('&lt;'));
		assert.ok(result.includes('&amp;'));
		assert.ok(result.includes('&gt;'));
	});
});
