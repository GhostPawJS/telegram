export interface StreamOpts {
	chatId: number;
	messageId?: number;
	parseMode?: 'HTML' | 'MarkdownV2' | 'Markdown';
	debounceMs?: number;
	maxLength?: number;
	onError?: (err: Error) => void;
}

export interface StreamHandle {
	/** Append text to the stream */
	write(chunk: string): void;
	/** Signal end of stream — flushes final content */
	end(): Promise<void>;
	/** Current accumulated text */
	readonly text: string;
	/** True after end() resolves */
	readonly done: boolean;
}
