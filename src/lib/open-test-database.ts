import { DatabaseSync } from 'node:sqlite';

import type { CalcDb } from '../database.ts';

/** In-memory SQLite for tests — async for harness compatibility. */
export async function openTestDatabase(): Promise<CalcDb> {
	const db = new DatabaseSync(':memory:');
	db.exec('PRAGMA foreign_keys = ON');
	return db;
}
