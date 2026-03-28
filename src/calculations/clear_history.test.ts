import { strictEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createInitializedCalcDb } from '../lib/test-db.ts';

import { add } from './add.ts';
import { clearHistory } from './clear_history.ts';
import { listHistory } from './list_history.ts';

describe('clearHistory', () => {
	it('returns 0 when nothing to clear', async () => {
		const db = await createInitializedCalcDb();
		strictEqual(clearHistory(db), 0);
		db.close();
	});

	it('removes all operations and returns the count', async () => {
		const db = await createInitializedCalcDb();
		add(db, 1, 2);
		add(db, 3, 4);
		const deleted = clearHistory(db);
		strictEqual(deleted, 2);
		strictEqual(listHistory(db).length, 0);
		db.close();
	});
});
