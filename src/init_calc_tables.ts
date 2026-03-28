import { initCalculationTables } from './calculations/init_calculation_tables.ts';
import type { CalcDb } from './database.ts';

/** Creates the full standalone calc schema. */
export function initCalcTables(db: CalcDb): void {
	initCalculationTables(db);
}
