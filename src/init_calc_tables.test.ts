import { strictEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';
import { initCalcTables } from './init_calc_tables.ts';
import { openTestDatabase } from './lib/open-test-database.ts';

describe('initCalcTables', () => {
	it('creates all expected tables', async () => {
		const db = await openTestDatabase();
		initCalcTables(db);
		const row = db.prepare('SELECT COUNT(*) AS c FROM operations').get() as { c: number };
		strictEqual(row.c, 0);
		db.close();
	});

	it('is idempotent', async () => {
		const db = await openTestDatabase();
		initCalcTables(db);
		initCalcTables(db);
		db.close();
	});
});
