import type { CalcDb } from '../database.ts';
import { withTransaction } from '../with_transaction.ts';

export function clearHistory(db: CalcDb): number {
	return withTransaction(db, () => {
		const result = db.prepare('DELETE FROM operations').run();
		return Number(result.changes ?? 0);
	});
}
