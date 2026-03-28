export interface StreamOpts {
	chatId: number;
	messageId?: number;
	parseMode?: 'HTML' | 'MarkdownV2' | 'Markdown';
	debounceMs?: number;
	maxLength?: number;
	onError?: (err: Error) => void;
}

export interface StreamHandle {
	/** Append a chunk and flush immediately (no debounce) */
	append(chunk: string): Promise<void>;
	/** Replace entire buffer content and flush immediately (no debounce) */
	replace(text: string): Promise<void>;
	/** Append text to the debounce buffer (fire-and-forget) */
	write(chunk: string): void;
	/** Signal end of stream — flushes final content */
	end(): Promise<void>;
	/** Current accumulated text */
	readonly text: string;
	/** True after end() resolves */
	readonly done: boolean;
}
