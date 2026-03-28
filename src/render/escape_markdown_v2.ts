// biome-ignore lint/complexity/noUselessEscapeInRegex: backslash must be escaped to match literal backslash
const SPECIAL_CHARS = /[_*[\]()~`>#+=|{}.!\\-]/g;

export function escapeMarkdownV2(text: string): string {
	return text.replace(SPECIAL_CHARS, (char) => `\\${char}`);
}
