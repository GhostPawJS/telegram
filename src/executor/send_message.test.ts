import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createMockGrammy } from '../lib/mock_grammy.ts';
import { sendMessage } from './send_message.ts';

describe('sendMessage', () => {
	it('sends correct chatId and text', async () => {
		const mock = createMockGrammy();
		mock.setResponse('sendMessage', { message_id: 1, chat: { id: 100 }, date: 1000 });
		await sendMessage(mock.bot, 100, 'hello');
		const call = mock.calls[0];
		assert.ok(call);
		const params = call.args[0] as Record<string, unknown>;
		assert.equal(params.chat_id, 100);
		assert.equal(params.text, 'hello');
	});

	it('includes parseMode when set', async () => {
		const mock = createMockGrammy();
		mock.setResponse('sendMessage', { message_id: 1, chat: { id: 1 }, date: 1 });
		await sendMessage(mock.bot, 1, 'hi', { parseMode: 'HTML' });
		const call = mock.calls[0];
		assert.ok(call);
		const params = call.args[0] as Record<string, unknown>;
		assert.equal(params.parse_mode, 'HTML');
	});

	it('includes replyMarkup when set', async () => {
		const mock = createMockGrammy();
		mock.setResponse('sendMessage', { message_id: 1, chat: { id: 1 }, date: 1 });
		const markup = { inline_keyboard: [] };
		await sendMessage(mock.bot, 1, 'hi', { replyMarkup: markup });
		const call = mock.calls[0];
		assert.ok(call);
		const params = call.args[0] as Record<string, unknown>;
		assert.deepEqual(params.reply_markup, markup);
	});

	it('includes replyToMessageId when set', async () => {
		const mock = createMockGrammy();
		mock.setResponse('sendMessage', { message_id: 1, chat: { id: 1 }, date: 1 });
		await sendMessage(mock.bot, 1, 'hi', { replyToMessageId: 42 });
		const call = mock.calls[0];
		assert.ok(call);
		const params = call.args[0] as Record<string, unknown>;
		assert.equal(params.reply_to_message_id, 42);
	});

	it('sets disable_web_page_preview when disablePreview is true', async () => {
		const mock = createMockGrammy();
		mock.setResponse('sendMessage', { message_id: 1, chat: { id: 1 }, date: 1 });
		await sendMessage(mock.bot, 1, 'hi', { disablePreview: true });
		const call = mock.calls[0];
		assert.ok(call);
		const params = call.args[0] as Record<string, unknown>;
		assert.equal(params.disable_web_page_preview, true);
	});

	it('returns SentMessage with chatId, messageId, date', async () => {
		const mock = createMockGrammy();
		mock.setResponse('sendMessage', { message_id: 99, chat: { id: 200 }, date: 5000 });
		const result = await sendMessage(mock.bot, 200, 'test');
		assert.equal(result.chatId, 200);
		assert.equal(result.messageId, 99);
		assert.equal(result.date, 5000);
	});

	it('includes messageThreadId when set', async () => {
		const mock = createMockGrammy();
		mock.setResponse('sendMessage', { message_id: 1, chat: { id: 1 }, date: 1 });
		await sendMessage(mock.bot, 1, 'hi', { messageThreadId: 7 });
		const call = mock.calls[0];
		assert.ok(call);
		const params = call.args[0] as Record<string, unknown>;
		assert.equal(params.message_thread_id, 7);
	});
});
