import { doesNotThrow, strictEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createInitializedTelegramDb } from './test-db.ts';

describe('createInitializedTelegramDb', () => {
	it('returns a usable in-memory database with schema applied', async () => {
		const db = await createInitializedTelegramDb();
		doesNotThrow(() => db.exec('SELECT 1'));
		strictEqual(typeof db.prepare, 'function');
		db.close();
	});
});
