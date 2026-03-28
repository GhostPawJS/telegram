import { strictEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createInitializedCalcDb } from '../lib/test-db.ts';

import { add } from './add.ts';

describe('add', () => {
	it('stores and returns the correct result', async () => {
		const db = await createInitializedCalcDb();
		const op = add(db, 3, 4);
		strictEqual(op.a, 3);
		strictEqual(op.b, 4);
		strictEqual(op.operator, '+');
		strictEqual(op.result, 7);
		strictEqual(typeof op.id, 'number');
		strictEqual(typeof op.createdAt, 'number');
		db.close();
	});

	it('handles negative numbers', async () => {
		const db = await createInitializedCalcDb();
		const op = add(db, -5, 3);
		strictEqual(op.result, -2);
		db.close();
	});
});
