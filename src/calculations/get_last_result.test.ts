import { strictEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createInitializedCalcDb } from '../lib/test-db.ts';

import { add } from './add.ts';
import { getLastResult } from './get_last_result.ts';
import { multiply } from './multiply.ts';

describe('getLastResult', () => {
	it('returns null when no operations exist', async () => {
		const db = await createInitializedCalcDb();
		strictEqual(getLastResult(db), null);
		db.close();
	});

	it('returns the most recent operation', async () => {
		const db = await createInitializedCalcDb();
		add(db, 1, 2, 1000);
		multiply(db, 3, 4, 2000);
		const last = getLastResult(db);
		strictEqual(last?.operator, '*');
		strictEqual(last?.result, 12);
		db.close();
	});
});
