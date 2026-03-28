import { strictEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createInitializedCalcDb } from '../lib/test-db.ts';

import { subtract } from './subtract.ts';

describe('subtract', () => {
	it('stores and returns the correct result', async () => {
		const db = await createInitializedCalcDb();
		const op = subtract(db, 10, 3);
		strictEqual(op.operator, '-');
		strictEqual(op.result, 7);
		db.close();
	});

	it('produces negative results', async () => {
		const db = await createInitializedCalcDb();
		const op = subtract(db, 3, 10);
		strictEqual(op.result, -7);
		db.close();
	});
});
