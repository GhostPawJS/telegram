export const OPERATORS = ['+', '-', '*', '/'] as const;
export type Operator = (typeof OPERATORS)[number];

export interface OperationRow {
	id: number;
	a: number;
	b: number;
	operator: Operator;
	result: number;
	created_at: number;
}

export interface OperationRecord {
	id: number;
	a: number;
	b: number;
	operator: Operator;
	result: number;
	createdAt: number;
}

export interface HistoryOptions {
	limit?: number | undefined;
}
