import { splitText } from './split_text.ts';

const DEFAULT_MAX_LENGTH = 1024;

export function splitCaption(text: string, maxLength: number = DEFAULT_MAX_LENGTH): string[] {
	return splitText(text, maxLength);
}
