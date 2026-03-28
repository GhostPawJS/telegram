import { strictEqual, throws } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { CalcValidationError } from '../errors.ts';
import { createInitializedCalcDb } from '../lib/test-db.ts';

import { divide } from './divide.ts';

describe('divide', () => {
	it('stores and returns the correct result', async () => {
		const db = await createInitializedCalcDb();
		const op = divide(db, 10, 2);
		strictEqual(op.operator, '/');
		strictEqual(op.result, 5);
		db.close();
	});

	it('handles fractional results', async () => {
		const db = await createInitializedCalcDb();
		const op = divide(db, 1, 3);
		strictEqual(op.result, 1 / 3);
		db.close();
	});

	it('throws CalcValidationError when dividing by zero', async () => {
		const db = await createInitializedCalcDb();
		throws(() => divide(db, 5, 0), CalcValidationError);
		db.close();
	});
});
