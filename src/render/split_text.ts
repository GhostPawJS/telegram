const DEFAULT_MAX_LENGTH = 4096;

export function splitText(text: string, maxLength: number = DEFAULT_MAX_LENGTH): string[] {
	const chunks: string[] = [];
	let remaining = text;

	while (remaining.length > 0) {
		if (remaining.length <= maxLength) {
			const chunk = remaining.trim();
			if (chunk.length > 0) {
				chunks.push(chunk);
			}
			break;
		}

		const slice = remaining.slice(0, maxLength);

		// Try paragraph boundary first
		const paraIdx = slice.lastIndexOf('\n\n');
		if (paraIdx !== -1) {
			const chunk = remaining.slice(0, paraIdx + 2).trim();
			remaining = remaining.slice(paraIdx + 2);
			if (chunk.length > 0) {
				chunks.push(chunk);
			}
			continue;
		}

		// Try line boundary
		const lineIdx = slice.lastIndexOf('\n');
		if (lineIdx !== -1) {
			const chunk = remaining.slice(0, lineIdx + 1).trim();
			remaining = remaining.slice(lineIdx + 1);
			if (chunk.length > 0) {
				chunks.push(chunk);
			}
			continue;
		}

		// Try word boundary
		const wordIdx = slice.lastIndexOf(' ');
		if (wordIdx !== -1) {
			const chunk = remaining.slice(0, wordIdx + 1).trim();
			remaining = remaining.slice(wordIdx + 1);
			if (chunk.length > 0) {
				chunks.push(chunk);
			}
			continue;
		}

		// Hard split
		const chunk = remaining.slice(0, maxLength).trim();
		remaining = remaining.slice(maxLength);
		if (chunk.length > 0) {
			chunks.push(chunk);
		}
	}

	return chunks;
}
