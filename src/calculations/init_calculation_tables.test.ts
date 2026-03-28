import { strictEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { openTestDatabase } from '../lib/open-test-database.ts';

import { initCalculationTables } from './init_calculation_tables.ts';

describe('initCalculationTables', () => {
	it('creates the operations table and index', async () => {
		const db = await openTestDatabase();
		initCalculationTables(db);

		const row = db.prepare('SELECT COUNT(*) AS c FROM operations').get() as { c: number };
		strictEqual(row.c, 0);
		db.close();
	});

	it('is idempotent', async () => {
		const db = await openTestDatabase();
		initCalculationTables(db);
		initCalculationTables(db);
		db.close();
	});
});
