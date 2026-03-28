export interface TelegramRunResult {
	lastInsertRowid: number | bigint;
	changes?: number | bigint | undefined;
}

export interface TelegramStatement {
	run(...params: unknown[]): TelegramRunResult;
	get<TRecord = Record<string, unknown>>(...params: unknown[]): TRecord | undefined;
	all<TRecord = Record<string, unknown>>(...params: unknown[]): TRecord[];
}

/**
 * SQLite dependency injected into every Telegram operation.
 * Node.js `DatabaseSync` satisfies this interface directly.
 */
export type TelegramDb = {
	exec(sql: string): void;
	prepare(sql: string): TelegramStatement;
	close(): void;
};
