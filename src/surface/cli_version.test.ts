import assert from 'node:assert/strict';
import { test } from 'node:test';
import { telegramVersion } from '../version.ts';
import { cliVersion } from './cli_version.ts';
import { runTelegramCli } from './telegram_cli_options.ts';

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

for (const alias of ['--version', '-V', '-v']) {
	const forms = [
		[alias],
		[alias, '--short'],
		['--short', alias],
		[alias, '--json'],
		['--json', alias],
		[alias, '--short', '--json'],
		[alias, '--json', '--short'],
		['--short', alias, '--json'],
		['--json', alias, '--short'],
		['--short', '--json', alias],
		['--json', '--short', alias],
	];
	for (const args of forms) {
		test(`CLI entry version: ${args.join(' ')}`, async (t) => {
			let output = '';
			let error = '';
			t.mock.method(process.stdout, 'write', (chunk: string) => {
				output += chunk;
				return true;
			});
			t.mock.method(process.stderr, 'write', (chunk: string) => {
				error += chunk;
				return true;
			});
			let code: number;
			try {
				code = await runTelegramCli(args);
			} finally {
				t.mock.restoreAll();
			}
			assert.equal(code, 0);
			assert.equal(error, '');
			assert.equal(output, `${cliVersion({ args, npm: false })}\n`);
		});
	}
}

test('JSON version includes the host target for every variant', () => {
	for (const binary of [false, true]) {
		for (const npm of [false, true]) {
			assert.deepEqual(
				JSON.parse(
					cliVersion({
						args: ['--short', '--json'],
						sea: () => binary,
						npm,
						platform: 'win32',
						arch: 'x64',
					}),
				),
				{
					name: 'telegram',
					version: telegramVersion,
					variant: binary ? 'binary' : npm ? 'npm' : 'library',
					target: 'windows-x64',
				},
			);
			assert.equal(cliVersion({ args: ['--short'], sea: () => binary, npm }), telegramVersion);
		}
	}
});
