import type { CalcDb } from '../database.ts';

export function initCalculationTables(db: CalcDb): void {
	db.exec(`
		CREATE TABLE IF NOT EXISTS operations (
			id         INTEGER PRIMARY KEY,
			a          REAL    NOT NULL,
			b          REAL    NOT NULL,
			operator   TEXT    NOT NULL CHECK (operator IN ('+', '-', '*', '/')),
			result     REAL    NOT NULL,
			created_at INTEGER NOT NULL
		)
	`);

	db.exec('CREATE INDEX IF NOT EXISTS operations_created_idx ON operations (created_at DESC)');
}
