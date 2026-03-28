import { doesNotThrow } from 'node:assert/strict';
import { describe, it } from 'node:test';
import { initTelegramTables } from './init_telegram_tables.ts';
import { openTestDatabase } from './lib/open-test-database.ts';

describe('initTelegramTables', () => {
	it('accepts a db and does not throw', async () => {
		const db = await openTestDatabase();
		doesNotThrow(() => initTelegramTables(db));
		db.close();
	});

	it('is idempotent — calling twice does not throw', async () => {
		const db = await openTestDatabase();
		doesNotThrow(() => {
			initTelegramTables(db);
			initTelegramTables(db);
		});
		db.close();
	});
});
