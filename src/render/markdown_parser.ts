/** Token subset consumed by the Telegram renderers. */
export interface Token {
	type: string;
	text: string;
	tokens: Token[];
	items: Token[];
	href: string;
	lang: string;
}
export namespace Tokens {
	export type Strong = Token;
	export type Em = Token;
	export type Del = Token;
	export type Codespan = Token;
	export type Code = Token;
	export type Link = Token;
	export type Blockquote = Token;
	export type Heading = Token;
	export type Paragraph = Token;
	export type List = Token;
	export type ListItem = Token;
	export type Text = Token;
	export type Escape = Token;
	export type HTML = Token;
	export type Tag = Token;
}
function readLink(source: string): [string, string, string, string] | null {
	const start = source.startsWith('![') ? 2 : source.startsWith('[') ? 1 : 0;
	if (!start) return null;
	let depth = 1;
	let end = start;
	for (; end < source.length; end++) {
		if (source[end] === '\\') {
			end++;
			continue;
		}
		if (source[end] === '[') depth++;
		if (source[end] === ']' && --depth === 0) break;
	}
	if (source.slice(end, end + 2) !== '](') return null;
	let pos = end + 2;
	depth = 1;
	let quote = '';
	for (; pos < source.length; pos++) {
		const char = source[pos];
		if (char === '\\') {
			pos++;
			continue;
		}
		if (quote) {
			if (char === quote) quote = '';
			continue;
		}
		if ((char === '"' || char === "'") && /\s/.test(source[pos - 1] ?? '')) {
			quote = char;
			continue;
		}
		if (char === '(') depth++;
		if (char === ')' && --depth === 0) break;
	}
	if (depth !== 0) return null;
	const destination = source
		.slice(end + 2, pos)
		.trim()
		.replace(/\s+(['"])[\s\S]*\1$/, '')
		.replace(/^<|>$/g, '');
	return [source.slice(0, pos + 1), start === 2 ? '!' : '', source.slice(start, end), destination];
}
function token(type: string, text: string, extra: Partial<Token> = {}): Token {
	return { type, text, tokens: [], items: [], href: '', lang: '', ...extra };
}
export class Renderer {
	parser!: Marked;
	declare strong: (t: Token) => string;
	declare em: (t: Token) => string;
	declare del: (t: Token) => string;
	declare codespan: (t: Token) => string;
	declare code: (t: Token) => string;
	declare link: (t: Token) => string;
	declare blockquote: (t: Token) => string;
	declare heading: (t: Token) => string;
	declare paragraph: (t: Token) => string;
	declare list: (t: Token) => string;
	declare listitem: (t: Token) => string;
	declare text: (t: Token) => string;
	declare html: (t: Token) => string;
	declare hr: () => string;
	declare image: () => string;
}

/** Synchronous Markdown lexer for the constructs supported by the renderers. */
export class Marked {
	private renderer: Renderer;
	private references = new Map<string, string>();
	constructor(options: { renderer: Renderer }) {
		this.renderer = options.renderer;
		options.renderer.parser = this;
	}
	parse(source: string | Token[], _options?: { async: false }): string {
		if (typeof source !== 'string') return source.map((t) => this.render(t)).join('');
		this.references.clear();
		const normalized = source
			.replace(/\r\n?/g, '\n')
			.replace(
				/^ {0,3}\[([^\]]+)\]:\s*<?([^\s>]+)>?(?:\s+['"(].*['")])?\s*$/gm,
				(_, id: string, href: string) => {
					this.references.set(id.toLowerCase(), href);
					return '';
				},
			);
		return this.blocks(normalized);
	}
	private render(t: Token): string {
		const r = this.renderer;
		switch (t.type) {
			case 'strong':
				return r.strong(t);
			case 'em':
				return r.em(t);
			case 'del':
				return r.del(t);
			case 'codespan':
				return r.codespan(t);
			case 'code':
				return r.code(t);
			case 'link':
				return r.link(t);
			case 'blockquote':
				return r.blockquote(t);
			case 'heading':
				return r.heading(t);
			case 'paragraph':
				return r.paragraph(t);
			case 'list':
				return r.list(t);
			case 'hr':
				return r.hr();
			case 'image':
				return r.image();
			case 'html':
				return r.html(t);
			case 'rendered':
				return t.text;
			case 'br':
				return '<br>';
			default:
				return r.text(t);
		}
	}
	parseInline(tokens: Token[]): string {
		return tokens.map((t) => this.render(t)).join('');
	}
	private inline(source: string): Token[] {
		const result: Token[] = [];
		const push = (type: string, text: string, extra: Partial<Token> = {}) =>
			result.push(token(type, text, extra));
		let pos = 0;
		while (pos < source.length) {
			const rest = source.slice(pos);
			const match0 = rest.match(/^\\([!"#$%&'()*+,\-./:;<=>?@[\]\\^_\x60{|}~])/);
			const match1 = rest.match(/^(?: {2,}|\\)\n/);
			const match2 = rest.match(/^(`+)([\s\S]*?[^\x60])\1(?!`)/);
			const match3 = readLink(rest);
			const match4 = rest.match(/^(!?)\[([^\]]+)\](?:\[([^\]]*)\])?/);
			const match5 = rest.match(/^<((?:https?:\/\/|mailto:)[^ >]+|[^ >@]+@[^ >]+)>/);
			const match6 = rest.match(
				/^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9.-]*[A-Za-z0-9])?\.[A-Za-z]{2,}/,
			);
			const match7 = rest.match(/^(?:https?:\/\/|www\.)[^\s<]+/);
			const match8 = rest.match(/^(?:<!--[\s\S]*?-->|<\/?[A-Za-z][^>]*>)/);
			if (match0) {
				push('escape', match0[1] ?? '');
				pos += match0[0].length;
			} else if (match1) {
				push('br', '');
				pos += match1[0].length;
			} else if (match2) {
				let text = (match2[2] ?? '').replace(/\n/g, ' ');
				if (/^ .* $/.test(text) && /[^ ]/.test(text)) text = text.slice(1, -1);
				push('codespan', text);
				pos += match2[0].length;
			} else if (match3) {
				const text = match3[2] ?? '';
				push(match3[1] ? 'image' : 'link', text, {
					href: (match3[3] ?? '').replace(/^<|>$/g, ''),
					tokens: this.inline(text),
				});
				pos += match3[0].length;
			} else if (match4 && this.references.has((match4[3] || match4[2] || '').toLowerCase())) {
				const text = match4[2] ?? '';
				push(match4[1] ? 'image' : 'link', text, {
					href: this.references.get((match4[3] || text).toLowerCase()) ?? '',
					tokens: this.inline(text),
				});
				pos += match4[0].length;
			} else if (match5) {
				const text = match5[1] ?? '';
				push('link', text, {
					href: text.includes('@') && !text.includes(':') ? `mailto:${text}` : text,
					tokens: [token('text', text)],
				});
				pos += match5[0].length;
			} else if (match6) {
				push('link', match6[0], {
					href: `mailto:${match6[0]}`,
					tokens: [token('text', match6[0])],
				});
				pos += match6[0].length;
			} else if (match7) {
				const text = match7[0].replace(/[.,:;!?]+$/, '');
				push('link', text, {
					href: text.startsWith('www.') ? `http://${text}` : text,
					tokens: [token('text', text)],
				});
				pos += text.length;
			} else if (match8) {
				push('html', match8[0]);
				pos += match8[0].length;
			} else {
				let matched = false;
				for (const delimiter of ['***', '___', '**', '__', '~~', '*', '_', '~']) {
					if (!rest.startsWith(delimiter) || /\s/.test(rest[delimiter.length] ?? ' ')) continue;
					if (delimiter.includes('_') && /[\p{L}\p{N}]/u.test(source[pos - 1] ?? '')) continue;
					if (
						delimiter.length === 2 &&
						!delimiter.includes('~') &&
						rest.startsWith(delimiter[0]?.repeat(3) ?? '')
					)
						continue;
					let end = -1;
					for (let cursor = delimiter.length; cursor < rest.length; cursor++) {
						if (rest[cursor] !== delimiter[0]) continue;
						let run = 1;
						while (rest[cursor + run] === delimiter[0]) run++;
						if (
							run >= delimiter.length &&
							(delimiter.length !== 1 || run % 2 === 1) &&
							!/\s/.test(rest[cursor - 1] ?? ' ') &&
							rest[cursor - 1] !== '\\' &&
							(!delimiter.includes('_') || !/[\p{L}\p{N}]/u.test(rest[cursor + run] ?? ''))
						) {
							end = cursor + run - delimiter.length;
							break;
						}
						cursor += run - 1;
					}
					if (end < 0) continue;
					const inner = rest.slice(delimiter.length, end);
					const kind = delimiter.includes('~')
						? 'del'
						: delimiter.length === 1 || delimiter.length === 3
							? 'em'
							: 'strong';
					let tokens = this.inline(inner);
					if (delimiter.length === 3) tokens = [token('strong', inner, { tokens })];
					push(kind, inner, { tokens });
					pos += end + delimiter.length;
					matched = true;
					break;
				}
				if (!matched) {
					const previous = result.at(-1);
					if (previous?.type === 'text') previous.text += source[pos];
					else push('text', source[pos] ?? '');
					pos++;
				}
			}
		}
		return result;
	}
	private blocks(source: string): string {
		const lines = source.split('\n');
		let i = 0;
		let out = '';
		const renderInline = (type: string, text: string) =>
			this.render(token(type, text, { tokens: this.inline(text) }));
		const startsBlock = (line: string) =>
			/^(?: {0,3}(?:#{1,6}\s|>|(?:[-+*]|\d+[.)])\s|`{3,}|~{3,}|(?:\*\s*){3,}$|(?:-\s*){3,}$|(?:_\s*){3,}$)| {4})/.test(
				line,
			);
		while (i < lines.length) {
			const line = lines[i] ?? '';
			const match0 = line.match(/^ {0,3}(`{3,}|~{3,})(.*)$/);
			const match1 = line.match(/^ {0,3}#{1,6}(?:\s+|$)(.*)$/);
			if (!line.trim()) {
				i++;
				continue;
			}
			if (
				/^ {0,3}<(?:address|article|aside|base|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|h[1-6]|head|header|hr|html|iframe|legend|li|link|main|menu|nav|ol|p|pre|script|section|style|summary|table|tbody|td|tfoot|th|thead|title|tr|ul)(?:\s|>|\/)/i.test(
					line,
				)
			) {
				const body: string[] = [];
				while (i < lines.length && lines[i]?.trim()) body.push(lines[i++] ?? '');
				out += this.render(token('html', body.join('\n') + (i < lines.length ? '\n' : '')));
				if (i < lines.length && !lines[i]?.trim()) {
					out += '\n';
					i++;
				}
			} else if (match0) {
				const fence = match0[1] ?? '';
				const body: string[] = [];
				i++;
				while (
					i < lines.length &&
					!new RegExp(`^ {0,3}${fence[0] === '`' ? '`' : '~'}{${fence.length},}\\s*$`).test(
						lines[i] ?? '',
					)
				)
					body.push(lines[i++] ?? '');
				if (i < lines.length) i++;
				out += this.render(token('code', body.join('\n'), { lang: (match0[2] ?? '').trim() }));
			} else if (/^ {4}|^\t/.test(line)) {
				const body: string[] = [];
				while (i < lines.length && (/^ {4}|^\t/.test(lines[i] ?? '') || !lines[i]?.trim()))
					body.push((lines[i++] ?? '').replace(/^(?: {4}|\t)/, ''));
				out += this.render(token('code', body.join('\n').replace(/\n+$/, '')));
			} else if (match1) {
				out += renderInline('heading', (match1[1] ?? '').replace(/\s+#+\s*$/, '').trim());
				i++;
			} else if (/^ {0,3}(?:(?:\*\s*){3,}|(?:-\s*){3,}|(?:_\s*){3,})$/.test(line)) {
				out += this.render(token('hr', ''));
				i++;
			} else if (/^ {0,3}>/.test(line)) {
				const body: string[] = [];
				while (
					i < lines.length &&
					(/^ {0,3}>/.test(lines[i] ?? '') ||
						(body.length > 0 && Boolean(lines[i]?.trim()) && !startsBlock(lines[i] ?? '')))
				)
					body.push((lines[i++] ?? '').replace(/^ {0,3}> ?/, ''));
				out += this.renderer.blockquote(
					token('blockquote', '', { tokens: [token('rendered', this.blocks(body.join('\n')))] }),
				);
			} else if (/^ {0,3}(?:[-+*]|\d+[.)])\s/.test(line)) {
				const items: Token[] = [];
				while (i < lines.length && /^ {0,3}(?:[-+*]|\d+[.)])\s/.test(lines[i] ?? '')) {
					let text = (lines[i++] ?? '')
						.replace(/^ {0,3}(?:[-+*]|\d+[.)])\s+/, '')
						.replace(/^\[[ xX]\]\s+/, '');
					while (i < lines.length && /^ +\S/.test(lines[i] ?? '')) {
						const continuation = (lines[i++] ?? '').trim();
						if (/^(?:[-+*]|\d+[.)])\s/.test(continuation))
							throw new Error('Token with "list" type was not found.');
						text += `\n${continuation}`;
					}
					items.push(token('listitem', text, { tokens: [token('text', text)] }));
				}
				out += this.render(token('list', '', { items }));
			} else if (
				line.includes('|') &&
				/^ *\|? *:?-+:? *(?:\| *:?-+:? *)+\|? *$/.test(lines[i + 1] ?? '')
			) {
				const cells = (row: string) =>
					row
						.trim()
						.replace(/^\||\|$/g, '')
						.split(/(?<!\\)\|/)
						.map((x) => x.trim().replace(/\\\|/g, '|'));
				const headings = cells(line);
				const align = cells(lines[i + 1] ?? '').map((x) =>
					x.startsWith(':') && x.endsWith(':')
						? 'center'
						: x.startsWith(':')
							? 'left'
							: x.endsWith(':')
								? 'right'
								: '',
				);
				const row = (values: string[], tag: string) =>
					'<tr>\n' +
					headings
						.map(
							(_, n) =>
								`<${tag}${align[n] ? ` align="${align[n]}"` : ''}>${this.parseInline(this.inline(values[n] ?? ''))}</${tag}>\n`,
						)
						.join('') +
					'</tr>\n';
				out += `<table>\n<thead>\n${row(headings, 'th')}</thead>\n`;
				i += 2;
				let body = '';
				while (i < lines.length && lines[i]?.trim() && !startsBlock(lines[i] ?? ''))
					body += row(cells(lines[i++] ?? ''), 'td');
				if (body) out += `<tbody>${body}</tbody>`;
				out += '</table>\n';
			} else if (i + 1 < lines.length && /^ {0,3}(?:=+|-+)\s*$/.test(lines[i + 1] ?? '')) {
				out += renderInline('heading', line.trim());
				i += 2;
			} else {
				const body = [line];
				i++;
				while (i < lines.length && lines[i]?.trim() && !startsBlock(lines[i] ?? ''))
					body.push(lines[i++] ?? '');
				out += renderInline('paragraph', body.join('\n'));
			}
		}
		return out;
	}
}
