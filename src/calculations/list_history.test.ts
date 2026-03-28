import { strictEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createInitializedCalcDb } from '../lib/test-db.ts';

import { add } from './add.ts';
import { listHistory } from './list_history.ts';

describe('listHistory', () => {
	it('returns empty array when no operations exist', async () => {
		const db = await createInitializedCalcDb();
		const history = listHistory(db);
		strictEqual(history.length, 0);
		db.close();
	});

	it('returns operations newest-first', async () => {
		const db = await createInitializedCalcDb();
		add(db, 1, 2, 1000);
		add(db, 3, 4, 2000);
		add(db, 5, 6, 3000);
		const history = listHistory(db);
		strictEqual(history.length, 3);
		strictEqual(history[0]?.createdAt, 3000);
		strictEqual(history[2]?.createdAt, 1000);
		db.close();
	});

	it('respects the limit option', async () => {
		const db = await createInitializedCalcDb();
		for (let i = 0; i < 10; i++) add(db, i, 1, i * 100);
		const history = listHistory(db, { limit: 3 });
		strictEqual(history.length, 3);
		db.close();
	});
});
