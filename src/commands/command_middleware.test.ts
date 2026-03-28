import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { Context } from 'grammy';
import { createCommandMiddleware } from './command_middleware.ts';
import { createCommandRegistry } from './command_registry.ts';
import type { CommandContext, CommandDef } from './types.ts';

function makeCtx(text: string, overrides = {}): Context {
	return {
		message: { text, message_id: 1 },
		chat: { id: 100 },
		from: { id: 42 },
		...overrides,
	} as unknown as Context;
}

async function noNext(): Promise<void> {
	throw new Error('next() should not have been called');
}

describe('createCommandMiddleware', () => {
	it('calls action with correct CommandContext for matching command', async () => {
		const registry = createCommandRegistry();
		const received: CommandContext[] = [];
		const def: CommandDef = {
			command: 'start',
			description: 'Start',
			action: (ctx) => {
				received.push(ctx);
			},
		};
		registry.register(def);
		const middleware = createCommandMiddleware(registry);
		await middleware(makeCtx('/start hello'), noNext);
		assert.equal(received.length, 1);
		const ctx = received[0];
		assert.ok(ctx);
		assert.equal(ctx.command, 'start');
		assert.deepEqual(ctx.args, ['hello']);
		assert.equal(ctx.rawText, '/start hello');
		assert.equal(ctx.chatId, 100);
		assert.equal(ctx.userId, 42);
		assert.equal(ctx.messageId, 1);
	});

	it('calls next() for unknown command', async () => {
		const registry = createCommandRegistry();
		const middleware = createCommandMiddleware(registry);
		let nextCalled = false;
		await middleware(makeCtx('/unknown'), async () => {
			nextCalled = true;
		});
		assert.ok(nextCalled);
	});

	it('calls next() when no text in message', async () => {
		const registry = createCommandRegistry();
		const middleware = createCommandMiddleware(registry);
		let nextCalled = false;
		const ctx = {
			message: { message_id: 1 },
			chat: { id: 100 },
			from: { id: 42 },
		} as unknown as Context;
		await middleware(ctx, async () => {
			nextCalled = true;
		});
		assert.ok(nextCalled);
	});

	it('calls next() when message is absent', async () => {
		const registry = createCommandRegistry();
		const middleware = createCommandMiddleware(registry);
		let nextCalled = false;
		const ctx = { chat: { id: 100 }, from: { id: 42 } } as unknown as Context;
		await middleware(ctx, async () => {
			nextCalled = true;
		});
		assert.ok(nextCalled);
	});

	it('filters by botUsername — matching bot calls action', async () => {
		const registry = createCommandRegistry();
		let called = false;
		registry.register({
			command: 'help',
			description: 'Help',
			action: () => {
				called = true;
			},
		});
		const middleware = createCommandMiddleware(registry, 'mybot');
		await middleware(makeCtx('/help@mybot'), noNext);
		assert.ok(called);
	});

	it('filters by botUsername — non-matching bot calls next()', async () => {
		const registry = createCommandRegistry();
		registry.register({ command: 'help', description: 'Help', action: noNext });
		const middleware = createCommandMiddleware(registry, 'mybot');
		let nextCalled = false;
		await middleware(makeCtx('/help@otherbot'), async () => {
			nextCalled = true;
		});
		assert.ok(nextCalled);
	});

	it('awaits async actions', async () => {
		const registry = createCommandRegistry();
		let resolved = false;
		registry.register({
			command: 'slow',
			description: 'Slow',
			action: async () => {
				await new Promise<void>((resolve) => setTimeout(resolve, 10));
				resolved = true;
			},
		});
		const middleware = createCommandMiddleware(registry);
		await middleware(makeCtx('/slow'), noNext);
		assert.ok(resolved);
	});
});
