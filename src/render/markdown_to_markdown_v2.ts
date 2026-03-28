import type { Tokens } from 'marked';
import { Marked, Renderer } from 'marked';
import { escapeMarkdownV2 } from './escape_markdown_v2.ts';

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

const markedMdV2 = new Marked({ renderer });

export function markdownToMarkdownV2(markdown: string): string {
	const result = markedMdV2.parse(markdown, { async: false }) as string;
	return result.trim();
}
