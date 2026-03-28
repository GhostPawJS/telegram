import { strictEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createInitializedCalcDb } from '../lib/test-db.ts';

import { multiply } from './multiply.ts';

describe('multiply', () => {
	it('stores and returns the correct result', async () => {
		const db = await createInitializedCalcDb();
		const op = multiply(db, 6, 7);
		strictEqual(op.operator, '*');
		strictEqual(op.result, 42);
		db.close();
	});

	it('handles multiplication by zero', async () => {
		const db = await createInitializedCalcDb();
		const op = multiply(db, 999, 0);
		strictEqual(op.result, 0);
		db.close();
	});
});
