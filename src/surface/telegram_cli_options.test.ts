import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Readable, Writable } from 'node:stream';
import { test } from 'node:test';
import { runToolCli } from '../surfaces/cli.ts';
import { cliCommands } from '../surfaces/cli_commands.ts';
import { telegramCliOptions } from './telegram_cli_options.ts';
import { telegramSurfaceTools } from './telegram_surface_tools.ts';

test('Telegram command paths cover every subcommand once without collisions', () => {
	const commands = cliCommands(telegramCliOptions.tools);
	assert.equal(commands.length, 27);
	assert.equal(new Set(commands.map((command) => command.path)).size, 27);
	for (const tool of telegramSurfaceTools) {
		const actions = tool.inputSchema.properties?.subcommand?.enum;
		assert.deepEqual(
			commands
				.filter((command) => command.tool.name === tool.name)
				.map((command) => command.fixed.subcommand),
			actions,
		);
	}
});

test('Telegram noun verb commands read an empty mirror and plan sends offline even with a token', async () => {
	const dir = mkdtempSync(join(tmpdir(), 'telegram-cli-'));
	const token = process.env.TELEGRAM_BOT_TOKEN;
	process.env.TELEGRAM_BOT_TOKEN = 'offline-test-token';
	try {
		const invoke = async (args: string[]) => {
			let out = '';
			let err = '';
			const code = await runToolCli([...args, '--db', join(dir, 'test.db'), '--json'], {
				...telegramCliOptions,
				stdin: Readable.from([]),
				stdout: new Writable({
					write(chunk, _encoding, cb) {
						out += String(chunk);
						cb();
					},
				}),
				stderr: new Writable({
					write(chunk, _encoding, cb) {
						err += String(chunk);
						cb();
					},
				}),
			});
			assert.equal(err, '');
			assert.equal(code, 0);
			return JSON.parse(out);
		};
		const plan = await invoke(['message', 'send', '123', 'Offline plan']);
		assert.equal(plan.ok, true);
		assert.equal(plan.data.action, 'send_message');
		assert.equal(plan.data.text, 'Offline plan');
		const moderation = await invoke(['member', 'unban', '123', '456']);
		assert.equal(moderation.data.action, 'unban_user');
		const read = await invoke(['mirror', 'chats']);
		assert.equal(read.ok, true);
		const messages = await invoke(['mirror', 'messages', '123']);
		assert.equal(messages.ok, true);
	} finally {
		if (token === undefined) delete process.env.TELEGRAM_BOT_TOKEN;
		else process.env.TELEGRAM_BOT_TOKEN = token;
		rmSync(dir, { recursive: true, force: true });
	}
});

test('global output flags after -- still apply and are not read as positionals', async () => {
	const dir = mkdtempSync(join(tmpdir(), 'telegram-cli-'));
	try {
		let out = '';
		const code = await runToolCli(
			['--db', join(dir, 'test.db'), 'message', 'send', '--', '-100123', 'After dashes', '--json'],
			{
				...telegramCliOptions,
				stdin: Readable.from([]),
				stdout: new Writable({
					write(chunk, _encoding, cb) {
						out += String(chunk);
						cb();
					},
				}),
				stderr: new Writable({
					write(_chunk, _encoding, cb) {
						cb();
					},
				}),
			},
		);
		assert.equal(code, 0);
		const result = JSON.parse(out);
		assert.equal(result.ok, true);
		assert.deepEqual(result.data, {
			action: 'send_message',
			chatId: -100123,
			text: 'After dashes',
		});
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
});
