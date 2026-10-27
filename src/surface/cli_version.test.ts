import assert from 'node:assert/strict';
import { test } from 'node:test';
import { telegramVersion } from '../version.ts';
import { cliVersion } from './cli_version.ts';

test('human version identifies binary, npm and library variants', () => {
	assert.equal(
		cliVersion({ sea: () => true, platform: 'linux', arch: 'x64', npm: true }),
		`telegram ${telegramVersion} (binary, linux-x64)`,
	);
	assert.equal(
		cliVersion({ sea: () => true, platform: 'win32', arch: 'x64' }),
		`telegram ${telegramVersion} (binary, windows-x64)`,
	);
	assert.equal(cliVersion({ sea: () => false, npm: true }), `telegram ${telegramVersion} (npm)`);
	assert.equal(
		cliVersion({ sea: () => false, npm: false }),
		`telegram ${telegramVersion} (library)`,
	);
	assert.equal(
		cliVersion({
			sea: () => {
				throw new Error('unavailable');
			},
			npm: false,
		}),
		`telegram ${telegramVersion} (library)`,
	);
});
