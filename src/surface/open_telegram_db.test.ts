import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { openTelegramDb } from './open_telegram_db.ts';

test('opens nested paths, initializes schema and configures WAL and timeout', async () => {
	const directory = mkdtempSync(join(tmpdir(), 'telegram-db-'));
	try {
		const db = await openTelegramDb(join(directory, 'nested', 'telegram.db'));
		try {
			assert.equal(
				db.prepare('PRAGMA journal_mode').get<{ journal_mode: string }>()?.journal_mode,
				'wal',
			);
			assert.equal(db.prepare('PRAGMA busy_timeout').get<{ timeout: number }>()?.timeout, 5000);
			assert.ok(db.prepare("SELECT name FROM sqlite_master WHERE name = 'messages'").get());
		} finally {
			db.close();
		}
	} finally {
		rmSync(directory, { recursive: true, force: true });
	}
	const db = await openTelegramDb(':memory:');
	db.close();
});
