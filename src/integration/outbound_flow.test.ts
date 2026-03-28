import { ok, strictEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createMockGrammy } from '../lib/mock_grammy.ts';
import {
	answerCallback,
	broadcast,
	deleteMessage,
	editMessage,
	pinMessage,
	sendChatAction,
	sendMessage,
	setReaction,
} from '../write.ts';

/** Default SentMessage-shaped response the mock must return for send/edit calls. */
const sentResponse = { message_id: 1, chat: { id: 100 }, date: 1700000000 };

describe('outbound flow', () => {
	it('sendMessage sends correct API call', async () => {
		const mock = createMockGrammy();
		mock.setResponse('sendMessage', sentResponse);

		await sendMessage(mock.bot, 100, 'hello', { parseMode: 'HTML' });

		strictEqual(mock.calls.length, 1);
		const call = mock.calls[0];
		strictEqual(call?.method, 'sendMessage');
		const params = call?.args[0] as Record<string, unknown>;
		strictEqual(params.chat_id, 100);
		strictEqual(params.text, 'hello');
		strictEqual(params.parse_mode, 'HTML');
	});

	it('editMessage sends editMessageText', async () => {
		const mock = createMockGrammy();
		mock.setResponse('editMessageText', sentResponse);

		await editMessage(mock.bot, 100, 5, 'new text');

		strictEqual(mock.calls.length, 1);
		const call = mock.calls[0];
		strictEqual(call?.method, 'editMessageText');
		const params = call?.args[0] as Record<string, unknown>;
		strictEqual(params.chat_id, 100);
		strictEqual(params.message_id, 5);
		strictEqual(params.text, 'new text');
	});

	it('deleteMessage sends deleteMessage API', async () => {
		const mock = createMockGrammy();

		await deleteMessage(mock.bot, 100, 42);

		strictEqual(mock.calls.length, 1);
		const call = mock.calls[0];
		strictEqual(call?.method, 'deleteMessage');
		const params = call?.args[0] as Record<string, unknown>;
		strictEqual(params.chat_id, 100);
		strictEqual(params.message_id, 42);
	});

	it('broadcast sends to all chats, returns correct counts', async () => {
		const mock = createMockGrammy();
		mock.setResponse('sendMessage', sentResponse);

		const result = await broadcast(mock.bot, [1, 2, 3], 'hello all', { delayMs: 0 });

		strictEqual(result.sent, 3);
		strictEqual(result.failed, 0);
		strictEqual(result.errors.length, 0);
	});

	it('broadcast handles partial failure gracefully', async () => {
		const mock = createMockGrammy();
		mock.setResponse('sendMessage', sentResponse);

		// Override call so chat 2 throws
		const originalCall = mock.bot.call;
		mock.bot.call = async (method, ...args) => {
			const params = args[0] as Record<string, unknown>;
			if (method === 'sendMessage' && params.chat_id === 2) {
				throw new Error('rate limited');
			}
			return originalCall(method, ...args);
		};

		const result = await broadcast(mock.bot, [1, 2, 3], 'hello all', { delayMs: 0 });

		strictEqual(result.sent, 2);
		strictEqual(result.failed, 1);
		strictEqual(result.errors.length, 1);
		const err = result.errors[0];
		strictEqual(err?.chatId, 2);
		ok(err?.error.includes('rate limited'));
	});

	it('answerCallback sends correct params', async () => {
		const mock = createMockGrammy();

		await answerCallback(mock.bot, 'cb-id-123', { text: 'Done', showAlert: true });

		strictEqual(mock.calls.length, 1);
		const call = mock.calls[0];
		strictEqual(call?.method, 'answerCallbackQuery');
		const params = call?.args[0] as Record<string, unknown>;
		strictEqual(params.callback_query_id, 'cb-id-123');
		strictEqual(params.text, 'Done');
		strictEqual(params.show_alert, true);
	});

	it('setReaction sends correct reaction array', async () => {
		const mock = createMockGrammy();

		await setReaction(mock.bot, 100, 5, [{ type: 'emoji', emoji: '👍' }]);

		strictEqual(mock.calls.length, 1);
		const call = mock.calls[0];
		strictEqual(call?.method, 'setMessageReaction');
		const params = call?.args[0] as Record<string, unknown>;
		strictEqual(params.chat_id, 100);
		strictEqual(params.message_id, 5);
		ok(Array.isArray(params.reaction));
		strictEqual((params.reaction as unknown[]).length, 1);
	});

	it('sendChatAction sends typing', async () => {
		const mock = createMockGrammy();

		await sendChatAction(mock.bot, 100, 'typing');

		strictEqual(mock.calls.length, 1);
		const call = mock.calls[0];
		strictEqual(call?.method, 'sendChatAction');
		const params = call?.args[0] as Record<string, unknown>;
		strictEqual(params.chat_id, 100);
		strictEqual(params.action, 'typing');
	});

	it('pinMessage sends pinChatMessage', async () => {
		const mock = createMockGrammy();

		await pinMessage(mock.bot, 100, 7);

		strictEqual(mock.calls.length, 1);
		const call = mock.calls[0];
		strictEqual(call?.method, 'pinChatMessage');
		const params = call?.args[0] as Record<string, unknown>;
		strictEqual(params.chat_id, 100);
		strictEqual(params.message_id, 7);
	});
});
