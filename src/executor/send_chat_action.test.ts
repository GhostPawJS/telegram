import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createMockGrammy } from '../lib/mock_grammy.ts';
import { sendChatAction } from './send_chat_action.ts';

describe('sendChatAction', () => {
	it('calls sendChatAction with action typing', async () => {
		const mock = createMockGrammy();
		await sendChatAction(mock.bot, 100, 'typing');
		const call = mock.calls[0];
		assert.ok(call);
		assert.equal(call.method, 'sendChatAction');
		const params = call.args[0] as Record<string, unknown>;
		assert.equal(params.chat_id, 100);
		assert.equal(params.action, 'typing');
	});

	it('includes messageThreadId when set', async () => {
		const mock = createMockGrammy();
		await sendChatAction(mock.bot, 1, 'upload_photo', { messageThreadId: 5 });
		const call = mock.calls[0];
		assert.ok(call);
		const params = call.args[0] as Record<string, unknown>;
		assert.equal(params.message_thread_id, 5);
	});

	it('does not include messageThreadId when not set', async () => {
		const mock = createMockGrammy();
		await sendChatAction(mock.bot, 1, 'typing');
		const call = mock.calls[0];
		assert.ok(call);
		const params = call.args[0] as Record<string, unknown>;
		assert.equal(params.message_thread_id, undefined);
	});
});
