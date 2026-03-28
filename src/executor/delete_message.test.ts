import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createMockGrammy } from '../lib/mock_grammy.ts';
import { deleteMessage } from './delete_message.ts';

describe('deleteMessage', () => {
	it('calls deleteMessage API with correct params', async () => {
		const mock = createMockGrammy();
		await deleteMessage(mock.bot, 100, 42);
		const call = mock.calls[0];
		assert.ok(call);
		assert.equal(call.method, 'deleteMessage');
		const params = call.args[0] as Record<string, unknown>;
		assert.equal(params.chat_id, 100);
		assert.equal(params.message_id, 42);
	});

	it('returns void', async () => {
		const mock = createMockGrammy();
		const result = await deleteMessage(mock.bot, 1, 1);
		assert.equal(result, undefined);
	});

	it('call is idempotent — double delete does not throw', async () => {
		const mock = createMockGrammy();
		await deleteMessage(mock.bot, 100, 1);
		await deleteMessage(mock.bot, 100, 1);
		assert.equal(mock.calls.length, 2);
	});
});
