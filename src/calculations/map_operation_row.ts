import type { OperationRecord, OperationRow } from './types.ts';

export function mapOperationRow(row: OperationRow): OperationRecord {
	return {
		id: row.id,
		a: row.a,
		b: row.b,
		operator: row.operator,
		result: row.result,
		createdAt: row.created_at,
	};
}
