import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createMockGrammy } from '../lib/mock_grammy.ts';
import { setReaction } from './set_reaction.ts';

describe('setReaction', () => {
	it('calls setMessageReaction with correct params', async () => {
		const mock = createMockGrammy();
		const reactions = [{ type: 'emoji' as const, emoji: '👍' }];
		await setReaction(mock.bot, 100, 42, reactions);
		const call = mock.calls[0];
		assert.ok(call);
		assert.equal(call.method, 'setMessageReaction');
		const params = call.args[0] as Record<string, unknown>;
		assert.equal(params.chat_id, 100);
		assert.equal(params.message_id, 42);
		assert.deepEqual(params.reaction, reactions);
		assert.equal(params.is_big, undefined);
	});

	it('includes is_big when isBig is true', async () => {
		const mock = createMockGrammy();
		await setReaction(mock.bot, 1, 1, [{ type: 'emoji', emoji: '❤️' }], true);
		const call = mock.calls[0];
		assert.ok(call);
		const params = call.args[0] as Record<string, unknown>;
		assert.equal(params.is_big, true);
	});

	it('sends empty reactions array to remove all reactions', async () => {
		const mock = createMockGrammy();
		await setReaction(mock.bot, 1, 1, []);
		const call = mock.calls[0];
		assert.ok(call);
		const params = call.args[0] as Record<string, unknown>;
		assert.deepEqual(params.reaction, []);
	});
});
