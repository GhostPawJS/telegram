import type { TelegramDb } from '../database.ts';
import { initTelegramTables } from '../init_telegram_tables.ts';

import { openTestDatabase } from './open-test-database.ts';

/** In-memory DB with full Telegram schema — shared by tests. */
export async function createInitializedTelegramDb(): Promise<TelegramDb> {
	const db = await openTestDatabase();
	initTelegramTables(db);
	return db;
}
