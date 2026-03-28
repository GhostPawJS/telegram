import type { CalcDb } from '../database.ts';

import { mapOperationRow } from './map_operation_row.ts';
import type { HistoryOptions, OperationRecord, OperationRow } from './types.ts';

export function listHistory(db: CalcDb, options: HistoryOptions = {}): OperationRecord[] {
	const limit = options.limit ?? 50;
	const rows = db
		.prepare('SELECT * FROM operations ORDER BY created_at DESC LIMIT ?')
		.all<OperationRow>(limit);
	return rows.map(mapOperationRow);
}
