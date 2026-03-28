export interface CalcRunResult {
	lastInsertRowid: number | bigint;
	changes?: number | bigint | undefined;
}

export interface CalcStatement {
	run(...params: unknown[]): CalcRunResult;
	get<TRecord = Record<string, unknown>>(...params: unknown[]): TRecord | undefined;
	all<TRecord = Record<string, unknown>>(...params: unknown[]): TRecord[];
}

/**
 * SQLite dependency injected into every calc operation.
 * Node.js `DatabaseSync` satisfies this interface directly.
 */
export type CalcDb = {
	exec(sql: string): void;
	prepare(sql: string): CalcStatement;
	close(): void;
};
