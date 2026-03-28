import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { TelegramValidationError } from '../errors.ts';
import { createCommandRegistry } from './command_registry.ts';
import type { CommandDef } from './types.ts';

function makeCmd(command: string): CommandDef {
	return {
		command,
		description: `Description for ${command}`,
		action: async () => {},
	};
}

describe('createCommandRegistry', () => {
	it('register and get returns the def', () => {
		const registry = createCommandRegistry();
		const def = makeCmd('start');
		registry.register(def);
		assert.equal(registry.get('start'), def);
	});

	it('get returns null for unknown command', () => {
		const registry = createCommandRegistry();
		assert.equal(registry.get('unknown'), null);
	});

	it('list returns all registered commands', () => {
		const registry = createCommandRegistry();
		const a = makeCmd('start');
		const b = makeCmd('help');
		registry.register(a);
		registry.register(b);
		const list = registry.list();
		assert.equal(list.length, 2);
		assert.ok(list.includes(a));
		assert.ok(list.includes(b));
	});

	it('list returns a copy, not the internal array', () => {
		const registry = createCommandRegistry();
		registry.register(makeCmd('start'));
		const list = registry.list();
		list.push(makeCmd('injected'));
		assert.equal(registry.list().length, 1);
	});

	it('throws TelegramValidationError when registering duplicate command', () => {
		const registry = createCommandRegistry();
		registry.register(makeCmd('start'));
		assert.throws(() => registry.register(makeCmd('start')), TelegramValidationError);
	});

	it('lookup is case-insensitive', () => {
		const registry = createCommandRegistry();
		const def = makeCmd('start');
		registry.register(def);
		assert.equal(registry.get('START'), def);
		assert.equal(registry.get('Start'), def);
	});

	it('duplicate detection is case-insensitive', () => {
		const registry = createCommandRegistry();
		registry.register(makeCmd('start'));
		assert.throws(() => registry.register(makeCmd('START')), TelegramValidationError);
	});
});
