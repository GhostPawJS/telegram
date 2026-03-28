export interface OverflowResult {
	fits: string;
	overflow: string;
}

/**
 * Given text and maxLength, splits at the last newline before maxLength,
 * or last space, or hard-cuts if no boundary found.
 */
export function chainOverflow(text: string, maxLength: number): OverflowResult {
	if (text.length <= maxLength) return { fits: text, overflow: '' };
	const nlIdx = text.lastIndexOf('\n', maxLength - 1);
	if (nlIdx > 0) return { fits: text.slice(0, nlIdx), overflow: text.slice(nlIdx + 1) };
	const spIdx = text.lastIndexOf(' ', maxLength - 1);
	if (spIdx > 0) return { fits: text.slice(0, spIdx), overflow: text.slice(spIdx + 1) };
	return { fits: text.slice(0, maxLength), overflow: text.slice(maxLength) };
}
