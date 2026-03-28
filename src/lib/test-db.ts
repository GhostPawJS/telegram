import type { CalcDb } from '../database.ts';
import { initCalcTables } from '../init_calc_tables.ts';

import { openTestDatabase } from './open-test-database.ts';

/** In-memory DB with full calc schema — shared by tests. */
export async function createInitializedCalcDb(): Promise<CalcDb> {
	const db = await openTestDatabase();
	initCalcTables(db);
	return db;
}
