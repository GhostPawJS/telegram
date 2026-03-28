import { DatabaseSync } from 'node:sqlite';

import type { TelegramDb } from '../database.ts';

/** In-memory SQLite for tests — async for harness compatibility. */
export async function openTestDatabase(): Promise<TelegramDb> {
	const db = new DatabaseSync(':memory:');
	db.exec('PRAGMA foreign_keys = ON');
	return db;
}
