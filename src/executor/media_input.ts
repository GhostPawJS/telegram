import type { InputFile } from 'grammy';
import { loadGrammy } from '../lib/lazy_dependencies.ts';

export type MediaInput = string | Buffer | { url: string };

export function resolveMediaInput(input: MediaInput): string | InputFile {
	if (typeof input === 'string') return input;
	const { InputFile } = loadGrammy();
	if (Buffer.isBuffer(input)) return new InputFile(input);
	return new InputFile({ url: input.url });
}
