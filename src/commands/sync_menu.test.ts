import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { Bot } from 'grammy';
import { createCommandRegistry } from './command_registry.ts';
import { syncMenu } from './sync_menu.ts';
import type { CommandDef } from './types.ts';

function makeBot(): { bot: Bot; calls: unknown[][] } {
	const calls: unknown[][] = [];
	const bot = {
		api: {
			setMyCommands: async (...args: unknown[]) => {
				calls.push(args);
				return true;
			},
		},
	} as unknown as Bot;
	return { bot, calls };
}

function makeCmd(command: string, description: string, scope?: CommandDef['scope']): CommandDef {
	const def: CommandDef = { command, description, action: async () => {} };
	if (scope !== undefined) def.scope = scope;
	return def;
}

describe('syncMenu', () => {
	it('calls setMyCommands with correct args for default scope', async () => {
		const registry = createCommandRegistry();
		registry.register(makeCmd('start', 'Start the bot'));
		const { bot, calls } = makeBot();
		await syncMenu(bot, registry);
		assert.equal(calls.length, 1);
		const [commands, opts] = calls[0] as [unknown[], unknown];
		assert.deepEqual(commands, [{ command: 'start', description: 'Start the bot' }]);
		assert.deepEqual(opts, { scope: { type: 'default' } });
	});

	it('groups by scope and calls setMyCommands once per scope', async () => {
		const registry = createCommandRegistry();
		registry.register(makeCmd('start', 'Start', 'default'));
		registry.register(makeCmd('help', 'Help', 'all_private_chats'));
		registry.register(makeCmd('admin', 'Admin', 'all_group_chats'));
		const { bot, calls } = makeBot();
		await syncMenu(bot, registry);
		assert.equal(calls.length, 3);
		const scopes = (calls as [unknown[], { scope: { type: string } }][]).map(
			([, opts]) => opts.scope.type,
		);
		assert.ok(scopes.includes('default'));
		assert.ok(scopes.includes('all_private_chats'));
		assert.ok(scopes.includes('all_group_chats'));
	});

	it('uses defaultScope when def has no scope', async () => {
		const registry = createCommandRegistry();
		registry.register(makeCmd('start', 'Start'));
		const { bot, calls } = makeBot();
		await syncMenu(bot, registry, 'all_private_chats');
		assert.equal(calls.length, 1);
		const [, opts] = calls[0] as [unknown[], { scope: { type: string } }];
		assert.equal(opts.scope.type, 'all_private_chats');
	});

	it('does not call setMyCommands when registry is empty', async () => {
		const registry = createCommandRegistry();
		const { bot, calls } = makeBot();
		await syncMenu(bot, registry);
		assert.equal(calls.length, 0);
	});

	it('groups multiple commands under the same scope into one call', async () => {
		const registry = createCommandRegistry();
		registry.register(makeCmd('start', 'Start'));
		registry.register(makeCmd('help', 'Help'));
		const { bot, calls } = makeBot();
		await syncMenu(bot, registry);
		assert.equal(calls.length, 1);
		const [commands] = calls[0] as [{ command: string; description: string }[]];
		assert.equal(commands.length, 2);
	});
});
