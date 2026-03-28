import { strictEqual } from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { describe, it } from 'node:test';

import type { TelegramDb } from './database.ts';

describe('TelegramDb', () => {
	it('DatabaseSync satisfies the TelegramDb interface', () => {
		const db: TelegramDb = new DatabaseSync(':memory:');
		db.exec('CREATE TABLE t (id INTEGER PRIMARY KEY)');
		const stmt = db.prepare('SELECT COUNT(*) AS c FROM t');
		const row = stmt.get() as { c: number };
		strictEqual(row.c, 0);
		db.close();
	});

	it('prepare().all() returns an array', () => {
		const db: TelegramDb = new DatabaseSync(':memory:');
		db.exec('CREATE TABLE t (v INTEGER)');
		db.prepare('INSERT INTO t VALUES (1)').run();
		db.prepare('INSERT INTO t VALUES (2)').run();
		const rows = db.prepare('SELECT v FROM t').all() as Array<{ v: number }>;
		strictEqual(rows.length, 2);
		db.close();
	});
});
