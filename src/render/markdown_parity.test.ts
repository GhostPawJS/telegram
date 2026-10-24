import assert from 'node:assert/strict';
import { it } from 'node:test';
import { Marked, Renderer, type Tokens } from 'marked';
import { escapeHtml } from './escape_html.ts';
import { escapeMarkdownV2 } from './escape_markdown_v2.ts';
import { markdownToHtml } from './markdown_to_html.ts';
import { markdownToMarkdownV2 } from './markdown_to_markdown_v2.ts';

function referenceHtml() {
	const renderer = new Renderer();

	renderer.strong = function (token: Tokens.Strong): string {
		return `<b>${this.parser.parseInline(token.tokens)}</b>`;
	};

	renderer.em = function (token: Tokens.Em): string {
		return `<i>${this.parser.parseInline(token.tokens)}</i>`;
	};

	renderer.del = function (token: Tokens.Del): string {
		return `<s>${this.parser.parseInline(token.tokens)}</s>`;
	};

	renderer.codespan = (token: Tokens.Codespan): string => `<code>${escapeHtml(token.text)}</code>`;

	renderer.code = (token: Tokens.Code): string => {
		const escaped = escapeHtml(token.text);
		if (token.lang) {
			return `<pre><code class="language-${token.lang}">${escaped}</code></pre>\n`;
		}
		return `<pre>${escaped}</pre>\n`;
	};

	renderer.link = function (token: Tokens.Link): string {
		const inner = this.parser.parseInline(token.tokens);
		return `<a href="${token.href}">${inner}</a>`;
	};

	renderer.blockquote = function (token: Tokens.Blockquote): string {
		const inner = this.parser.parse(token.tokens).trim();
		return `<blockquote>${inner}</blockquote>\n`;
	};

	renderer.heading = function (token: Tokens.Heading): string {
		return `<b>${this.parser.parseInline(token.tokens)}</b>\n`;
	};

	renderer.paragraph = function (token: Tokens.Paragraph): string {
		return `${this.parser.parseInline(token.tokens)}\n`;
	};

	renderer.list = function (token: Tokens.List): string {
		return token.items.map((item) => this.listitem(item)).join('');
	};

	renderer.listitem = function (token: Tokens.ListItem): string {
		const inner = this.parser.parseInline(token.tokens);
		return `• ${inner}\n`;
	};

	renderer.hr = (): string => '\n';

	renderer.image = (): string => '';

	renderer.text = (token: Tokens.Text | Tokens.Escape): string => escapeHtml(token.text);

	renderer.html = (token: Tokens.HTML | Tokens.Tag): string => escapeHtml(token.text);

	return new Marked({ renderer });
}

function referenceMd() {
	const renderer = new Renderer();

	renderer.strong = function (token: Tokens.Strong): string {
		const inner = this.parser.parseInline(token.tokens);
		return `*${inner}*`;
	};

	renderer.em = function (token: Tokens.Em): string {
		const inner = this.parser.parseInline(token.tokens);
		return `_${inner}_`;
	};

	renderer.del = function (token: Tokens.Del): string {
		const inner = this.parser.parseInline(token.tokens);
		return `~${inner}~`;
	};

	renderer.codespan = (token: Tokens.Codespan): string => `\`${token.text}\``;

	renderer.code = (token: Tokens.Code): string => {
		const lang = token.lang ?? '';
		return `\`\`\`${lang}\n${token.text}\n\`\`\`\n`;
	};

	renderer.link = function (token: Tokens.Link): string {
		const inner = this.parser.parseInline(token.tokens);
		return `[${inner}](${token.href})`;
	};

	renderer.blockquote = function (token: Tokens.Blockquote): string {
		const inner = this.parser.parse(token.tokens).trim();
		return `>${inner}\n`;
	};

	renderer.heading = function (token: Tokens.Heading): string {
		const inner = this.parser.parseInline(token.tokens);
		return `*${inner}*\n`;
	};

	renderer.paragraph = function (token: Tokens.Paragraph): string {
		const inner = this.parser.parseInline(token.tokens);
		return `${inner}\n`;
	};

	renderer.list = function (token: Tokens.List): string {
		return token.items.map((item) => this.listitem(item)).join('');
	};

	renderer.listitem = function (token: Tokens.ListItem): string {
		const inner = this.parser.parseInline(token.tokens);
		return `• ${inner}\n`;
	};

	renderer.hr = (): string => '\n';

	renderer.image = (): string => '';

	renderer.text = (token: Tokens.Text | Tokens.Escape): string => escapeMarkdownV2(token.text);

	renderer.html = (token: Tokens.HTML | Tokens.Tag): string => escapeMarkdownV2(token.text);

	return new Marked({ renderer });
}

const corpus = [
	'_a_b_',
	'__a_b__',
	'_a_b',
	'**a** **b**',
	'*a **b** c*',
	'**a *b* c**',
	'***a** b*',
	'**a *b***',
	'[a *b*](https://example.com "title")',
	'[a](a(b(c)))',
	'\u0060\u0060 code \u0060\u0060',
	'<div>\nhello **world**\n</div>\n\nafter',
	'- one\n\n- two',
	'- a\n  continuation',
	'> quote\nlazy continuation',
	'foo\n---',
	'```js extra\nx\n```',
	'```\nx',
	'a\\\nb',
	'a [missing] b',
	'<user@example.com>',
	'left\r\nright',

	'| a | b |\n|---|:---:|\n| c | **d** |',
	'a@b.com',
	'[text](https://example.com/a_(b))',
	'> outer\n>\n> inner',
	'a\n\n---\n\nb',
	'<div>hello</div>',
	'![alt](url "title")',
	'***a***',
	'foo_bar_baz',
	'**announcement**',
	'console.log',
	'some code',
	'hello. world!',
	'a.b!c',
	'',
	'plain',
	'**bold**',
	'*italic*',
	'_italic_',
	'__bold__',
	'~~del~~',
	'~del~',
	'`code`',
	'``a ` b``',
	'` a `',
	'`a\nb`',
	'```js\nconsole.log("hi")\n```',
	'```\nsome code\n```',
	'~~~text\nhello\n~~~',
	'    indented\n    code',
	'[text](url)',
	'[**bold link**](https://example.com)',
	'![image](photo.jpg)',
	'> quote',
	'> first\n> second',
	'# Heading',
	'## heading **bold**',
	'title\n=====',
	'title\n-----',
	'---',
	'***',
	'___',
	'- one\n- two',
	'1. one\n2. two',
	'- **bold**\n- *italic*',
	'- [x] done\n- [ ] todo',
	'a\nb',
	'a\n\nb',
	'a  \nb',
	'hello. world!',
	'Hello <world> & stuff',
	'`a < b && c > d`',
	'just plain text',
	'***bold italic***',
	'**bold and *italic* inside**',
	'\\*literal\\*',
	'&amp; &copy; &#123;',
	'<b>raw</b>',
	'<!-- comment -->',
	'<https://example.com>',
	'https://example.com',
	'www.example.com',
	'[reference][id]\n\n[id]: https://example.com',
	'[id][]\n\n[id]: url',
	'paragraph\n\n> quote\n\nend',
	'# Title\n\n**hello** and `code`',
	'hello_world.txt!',
	'a.b!c',
	'Hello <world> & stuff',
	'hello world',
];
const html = referenceHtml();
const md = referenceMd();
for (const input of corpus) {
	it(`matches marked for ${JSON.stringify(input)}`, () => {
		assert.equal(markdownToHtml(input), (html.parse(input, { async: false }) as string).trim());
		assert.equal(markdownToMarkdownV2(input), (md.parse(input, { async: false }) as string).trim());
	});
}

it('preserves the renderer error for nested lists', () => {
	for (const render of [markdownToHtml, markdownToMarkdownV2]) {
		assert.throws(() => render('- outer\n  - inner'), /Token with "list" type was not found/);
	}
	for (const reference of [html, md]) {
		assert.throws(
			() => reference.parse('- outer\n  - inner', { async: false }),
			/Token with "list" type was not found/,
		);
	}
});
