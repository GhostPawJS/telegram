import type { CalcDb } from '../database.ts';
import { resolveNow } from '../resolve_now.ts';
import { withTransaction } from '../with_transaction.ts';

import { mapOperationRow } from './map_operation_row.ts';
import type { OperationRecord, OperationRow } from './types.ts';
import { assertFiniteNumber } from './validators.ts';

export function subtract(db: CalcDb, a: number, b: number, now?: number): OperationRecord {
	assertFiniteNumber(a, 'a');
	assertFiniteNumber(b, 'b');
	const timestamp = resolveNow(now);
	const result = a - b;
	return withTransaction(db, () => {
		const insert = db
			.prepare('INSERT INTO operations (a, b, operator, result, created_at) VALUES (?, ?, ?, ?, ?)')
			.run(a, b, '-', result, timestamp);
		const row = db
			.prepare('SELECT * FROM operations WHERE id = ?')
			.get<OperationRow>(Number(insert.lastInsertRowid));
		if (!row) throw new Error('Inserted operation could not be reloaded.');
		return mapOperationRow(row);
	});
}
