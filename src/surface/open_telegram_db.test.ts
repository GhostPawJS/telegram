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

test(
	'new mirror files and directories are private; existing modes are preserved',
	{ skip: process.platform === 'win32' },
	async () => {
		const { chmodSync, statSync, writeFileSync } = await import('node:fs');
		const directory = mkdtempSync(join(tmpdir(), 'telegram-private-'));
		const previous = process.umask(0);
		try {
			const path = join(directory, 'one', 'two', 'mirror.db');
			const db = await openTelegramDb(path);
			try {
				for (const suffix of ['', '-wal', '-shm'])
					assert.equal(statSync(path + suffix).mode & 0o777, 0o600, suffix || 'database');
				for (const part of ['one', 'one/two'])
					assert.equal(statSync(join(directory, part)).mode & 0o777, 0o700);
			} finally {
				db.close();
			}
			chmodSync(join(directory, 'one'), 0o755);
			chmodSync(path, 0o640);
			const existing = await openTelegramDb(path);
			existing.close();
			assert.equal(statSync(path).mode & 0o777, 0o640);
			assert.equal(statSync(join(directory, 'one')).mode & 0o777, 0o755);
			const empty = join(directory, 'empty.db');
			writeFileSync(empty, '', { mode: 0o644 });
			const emptyDb = await openTelegramDb(empty);
			emptyDb.close();
			assert.equal(statSync(empty).mode & 0o777, 0o644);
		} finally {
			process.umask(previous);
			rmSync(directory, { recursive: true, force: true });
		}
	},
);
