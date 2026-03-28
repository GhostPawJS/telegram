import { strictEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createInitializedCalcDb } from '../lib/test-db.ts';

import { calculateToolHandler } from './calculate_tool.ts';

describe('calculateToolHandler', () => {
	it('returns a success result for addition', async () => {
		const db = await createInitializedCalcDb();
		const result = calculateToolHandler(db, { a: 3, b: 4, operator: '+' });
		strictEqual(result.ok, true);
		if (result.ok) strictEqual(result.data.operation.result, 7);
		db.close();
	});

	it('returns a domain error for division by zero', async () => {
		const db = await createInitializedCalcDb();
		const result = calculateToolHandler(db, { a: 5, b: 0, operator: '/' });
		strictEqual(result.ok, false);
		strictEqual(result.outcome, 'error');
		db.close();
	});

	it('handles all four operators', async () => {
		const db = await createInitializedCalcDb();
		strictEqual(calculateToolHandler(db, { a: 10, b: 2, operator: '-' }).ok, true);
		strictEqual(calculateToolHandler(db, { a: 3, b: 3, operator: '*' }).ok, true);
		strictEqual(calculateToolHandler(db, { a: 9, b: 3, operator: '/' }).ok, true);
		db.close();
	});
});
