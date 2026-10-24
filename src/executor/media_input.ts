import { InputFile } from '../bot_api/input_file.ts';

export type MediaInput = string | Buffer | { url: string };

export function resolveMediaInput(input: MediaInput): string | InputFile {
	if (typeof input === 'string') return input;
	if (Buffer.isBuffer(input)) return new InputFile(input);
	return new InputFile({ url: input.url });
}
