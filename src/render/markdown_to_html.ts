import type { Tokens } from 'marked';
import { Marked, Renderer } from 'marked';
import { escapeHtml } from './escape_html.ts';

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

const markedHtml = new Marked({ renderer });

export function markdownToHtml(markdown: string): string {
	const result = markedHtml.parse(markdown, { async: false }) as string;
	return result.trim();
}
