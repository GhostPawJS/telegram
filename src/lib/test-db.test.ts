import { strictEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createInitializedCalcDb } from './test-db.ts';

describe('createInitializedCalcDb', () => {
	it('returns a database with the full schema applied', async () => {
		const db = await createInitializedCalcDb();
		const row = db.prepare('SELECT COUNT(*) AS c FROM operations').get() as { c: number };
		strictEqual(row.c, 0);
		db.close();
	});
});
