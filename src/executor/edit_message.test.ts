import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createMockGrammy } from '../lib/mock_grammy.ts';
import { editMessage } from './edit_message.ts';

describe('editMessage', () => {
	it('calls editMessageText with correct params', async () => {
		const mock = createMockGrammy();
		mock.setResponse('editMessageText', { message_id: 5, chat: { id: 10 }, date: 2000 });
		await editMessage(mock.bot, 10, 5, 'updated text');
		const call = mock.calls[0];
		assert.ok(call);
		assert.equal(call.method, 'editMessageText');
		const params = call.args[0] as Record<string, unknown>;
		assert.equal(params.chat_id, 10);
		assert.equal(params.message_id, 5);
		assert.equal(params.text, 'updated text');
	});

	it('returns SentMessage', async () => {
		const mock = createMockGrammy();
		mock.setResponse('editMessageText', { message_id: 5, chat: { id: 10 }, date: 2000 });
		const result = await editMessage(mock.bot, 10, 5, 'updated text');
		assert.equal(result.chatId, 10);
		assert.equal(result.messageId, 5);
		assert.equal(result.date, 2000);
	});

	it('includes parseMode when set', async () => {
		const mock = createMockGrammy();
		mock.setResponse('editMessageText', { message_id: 1, chat: { id: 1 }, date: 1 });
		await editMessage(mock.bot, 1, 1, 'hi', { parseMode: 'MarkdownV2' });
		const call = mock.calls[0];
		assert.ok(call);
		const params = call.args[0] as Record<string, unknown>;
		assert.equal(params.parse_mode, 'MarkdownV2');
	});

	it('includes replyMarkup when set', async () => {
		const mock = createMockGrammy();
		mock.setResponse('editMessageText', { message_id: 1, chat: { id: 1 }, date: 1 });
		const markup = { inline_keyboard: [] };
		await editMessage(mock.bot, 1, 1, 'hi', { replyMarkup: markup });
		const call = mock.calls[0];
		assert.ok(call);
		const params = call.args[0] as Record<string, unknown>;
		assert.deepEqual(params.reply_markup, markup);
	});

	it('sets disable_web_page_preview when disablePreview is true', async () => {
		const mock = createMockGrammy();
		mock.setResponse('editMessageText', { message_id: 1, chat: { id: 1 }, date: 1 });
		await editMessage(mock.bot, 1, 1, 'hi', { disablePreview: true });
		const call = mock.calls[0];
		assert.ok(call);
		const params = call.args[0] as Record<string, unknown>;
		assert.equal(params.disable_web_page_preview, true);
	});
});
