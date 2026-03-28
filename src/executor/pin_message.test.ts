import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createMockGrammy } from '../lib/mock_grammy.ts';
import { pinMessage, unpinMessage } from './pin_message.ts';

describe('pinMessage', () => {
	it('calls pinChatMessage with correct params', async () => {
		const mock = createMockGrammy();
		await pinMessage(mock.bot, 100, 42);
		const call = mock.calls[0];
		assert.ok(call);
		assert.equal(call.method, 'pinChatMessage');
		const params = call.args[0] as Record<string, unknown>;
		assert.equal(params.chat_id, 100);
		assert.equal(params.message_id, 42);
	});

	it('disableNotification defaults to false', async () => {
		const mock = createMockGrammy();
		await pinMessage(mock.bot, 1, 1);
		const call = mock.calls[0];
		assert.ok(call);
		const params = call.args[0] as Record<string, unknown>;
		assert.equal(params.disable_notification, false);
	});

	it('passes disableNotification true when set', async () => {
		const mock = createMockGrammy();
		await pinMessage(mock.bot, 1, 1, true);
		const call = mock.calls[0];
		assert.ok(call);
		const params = call.args[0] as Record<string, unknown>;
		assert.equal(params.disable_notification, true);
	});
});

describe('unpinMessage', () => {
	it('calls unpinChatMessage with correct params', async () => {
		const mock = createMockGrammy();
		await unpinMessage(mock.bot, 100, 42);
		const call = mock.calls[0];
		assert.ok(call);
		assert.equal(call.method, 'unpinChatMessage');
		const params = call.args[0] as Record<string, unknown>;
		assert.equal(params.chat_id, 100);
		assert.equal(params.message_id, 42);
	});
});
