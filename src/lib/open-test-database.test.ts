import { strictEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { openTestDatabase } from './open-test-database.ts';

describe('openTestDatabase', () => {
	it('returns a usable in-memory database', async () => {
		const db = await openTestDatabase();
		db.exec('CREATE TABLE t (id INTEGER PRIMARY KEY)');
		const row = db.prepare('SELECT COUNT(*) AS c FROM t').get() as { c: number };
		strictEqual(row.c, 0);
		db.close();
	});
});
