import { strictEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createInitializedCalcDb } from '../lib/test-db.ts';

import { calculateToolHandler } from './calculate_tool.ts';
import { reviewHistoryToolHandler } from './review_history_tool.ts';

describe('reviewHistoryToolHandler', () => {
	it('returns empty_result warning when history is empty', async () => {
		const db = await createInitializedCalcDb();
		const result = reviewHistoryToolHandler(db, {});
		strictEqual(result.ok, true);
		if (result.ok) strictEqual(result.data.total, 0);
		strictEqual(result.warnings?.[0]?.code, 'empty_result');
		db.close();
	});

	it('returns operations after calculations are performed', async () => {
		const db = await createInitializedCalcDb();
		calculateToolHandler(db, { a: 1, b: 2, operator: '+' });
		calculateToolHandler(db, { a: 3, b: 4, operator: '*' });
		const result = reviewHistoryToolHandler(db, {});
		strictEqual(result.ok, true);
		if (result.ok) strictEqual(result.data.total, 2);
		db.close();
	});
});
