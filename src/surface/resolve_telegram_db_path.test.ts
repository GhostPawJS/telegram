import assert from 'node:assert/strict';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { resolveTelegramDbPath } from './resolve_telegram_db_path.ts';

test('database path precedence is flag, environment, home default', () => {
	assert.equal(
		resolveTelegramDbPath({ flag: ':memory:', env: { GHOSTPAW_TELEGRAM_DB: 'env' } }),
		':memory:',
	);
	assert.equal(resolveTelegramDbPath({ env: { GHOSTPAW_TELEGRAM_DB: 'env' } }), 'env');
	assert.equal(resolveTelegramDbPath({ env: {} }), join(homedir(), '.ghostpaw', 'telegram.db'));
});

test('empty environment path uses the default', () => {
	assert.equal(
		resolveTelegramDbPath({ env: { GHOSTPAW_TELEGRAM_DB: '' } }),
		resolveTelegramDbPath({ env: {} }),
	);
});
