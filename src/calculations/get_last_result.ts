import type { CalcDb } from '../database.ts';

import { mapOperationRow } from './map_operation_row.ts';
import type { OperationRecord, OperationRow } from './types.ts';

export function getLastResult(db: CalcDb): OperationRecord | null {
	const row = db
		.prepare('SELECT * FROM operations ORDER BY created_at DESC, id DESC LIMIT 1')
		.get<OperationRow>();
	return row ? mapOperationRow(row) : null;
}
