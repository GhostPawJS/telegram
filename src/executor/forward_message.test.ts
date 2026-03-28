import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createMockGrammy } from '../lib/mock_grammy.ts';
import { forwardMessage } from './forward_message.ts';

describe('forwardMessage', () => {
	it('calls forwardMessage with correct params', async () => {
		const mock = createMockGrammy();
		mock.setResponse('forwardMessage', { message_id: 10, chat: { id: 200 }, date: 3000 });
		await forwardMessage(mock.bot, 200, 100, 50);
		const call = mock.calls[0];
		assert.ok(call);
		assert.equal(call.method, 'forwardMessage');
		const params = call.args[0] as Record<string, unknown>;
		assert.equal(params.chat_id, 200);
		assert.equal(params.from_chat_id, 100);
		assert.equal(params.message_id, 50);
	});

	it('returns SentMessage', async () => {
		const mock = createMockGrammy();
		mock.setResponse('forwardMessage', { message_id: 10, chat: { id: 200 }, date: 3000 });
		const result = await forwardMessage(mock.bot, 200, 100, 50);
		assert.equal(result.chatId, 200);
		assert.equal(result.messageId, 10);
		assert.equal(result.date, 3000);
	});

	it('includes disableNotification when set', async () => {
		const mock = createMockGrammy();
		mock.setResponse('forwardMessage', { message_id: 1, chat: { id: 1 }, date: 1 });
		await forwardMessage(mock.bot, 1, 2, 3, { disableNotification: true });
		const call = mock.calls[0];
		assert.ok(call);
		const params = call.args[0] as Record<string, unknown>;
		assert.equal(params.disable_notification, true);
	});

	it('includes protectContent when set', async () => {
		const mock = createMockGrammy();
		mock.setResponse('forwardMessage', { message_id: 1, chat: { id: 1 }, date: 1 });
		await forwardMessage(mock.bot, 1, 2, 3, { protectContent: true });
		const call = mock.calls[0];
		assert.ok(call);
		const params = call.args[0] as Record<string, unknown>;
		assert.equal(params.protect_content, true);
	});
});
