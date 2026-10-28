import assert from 'node:assert/strict';
import { test } from 'node:test';
import { cliCommands } from '../surfaces/cli_commands.ts';
import { telegramCliSurfaceTools } from './telegram_surface_tools.ts';

test('telegram marks no CLI argument file-capable, so message text stays literal', () => {
	for (const tool of telegramCliSurfaceTools)
		assert.equal(tool.cli?.fileArgs, undefined, tool.name);
	assert.ok(
		cliCommands(telegramCliSurfaceTools).some((command) => command.path === 'message send'),
	);
});
