/** A reusable upload source. Strings refer to local files; URL objects are downloaded. */
export class InputFile {
	readonly fileData: Uint8Array | string | { url: string };
	readonly filename: string | undefined;
	constructor(file: Uint8Array | string | { url: string }, filename?: string) {
		this.fileData = file;
		this.filename = filename;
	}
	async toBlob(fetcher: typeof fetch): Promise<Blob> {
		if (typeof this.fileData === 'string') {
			const { readFile } = await import('node:fs/promises');
			return new Blob([new Uint8Array(await readFile(this.fileData))]);
		}
		if ('url' in this.fileData) {
			const response = await fetcher(this.fileData.url);
			if (!response.ok) throw new Error(`Upload download failed: HTTP ${response.status}`);
			return response.blob();
		}
		return new Blob([new Uint8Array(this.fileData)]);
	}
}
export function containsInputFile(value: unknown): boolean {
	if (value instanceof InputFile) return true;
	if (Array.isArray(value)) return value.some(containsInputFile);
	return (
		value !== null && typeof value === 'object' && Object.values(value).some(containsInputFile)
	);
}
