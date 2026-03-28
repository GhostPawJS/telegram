import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createMockGrammy } from '../lib/mock_grammy.ts';
import { broadcast } from './broadcast.ts';

describe('broadcast', () => {
	it('sends to all chatIds and returns correct sent count', async () => {
		const mock = createMockGrammy();
		mock.setResponse('sendMessage', { message_id: 1, chat: { id: 1 }, date: 1 });
		const result = await broadcast(mock.bot, [1, 2, 3], 'hello', { delayMs: 0 });
		assert.equal(result.sent, 3);
		assert.equal(result.failed, 0);
		assert.equal(result.errors.length, 0);
		assert.equal(mock.calls.length, 3);
	});

	it('records failures and calls onError', async () => {
		const mock = createMockGrammy();
		let callCount = 0;
		// Override bot.call to throw on second chatId
		const originalCall = mock.bot.call;
		mock.bot.call = async (method, ...args) => {
			if (method === 'sendMessage') {
				const params = args[0] as Record<string, unknown>;
				if (params.chat_id === 2) {
					throw new Error('Forbidden');
				}
			}
			return originalCall(method, ...args);
		};
		mock.setResponse('sendMessage', { message_id: 1, chat: { id: 1 }, date: 1 });

		const errorChatIds: number[] = [];
		const result = await broadcast(mock.bot, [1, 2, 3], 'hello', {
			delayMs: 0,
			onError: (chatId) => {
				errorChatIds.push(chatId);
				callCount++;
			},
		});

		assert.equal(result.sent, 2);
		assert.equal(result.failed, 1);
		assert.equal(result.errors.length, 1);
		const err = result.errors[0];
		assert.ok(err);
		assert.equal(err.chatId, 2);
		assert.equal(err.error, 'Forbidden');
		assert.equal(callCount, 1);
		assert.deepEqual(errorChatIds, [2]);
	});

	it('returns empty result for empty chatIds', async () => {
		const mock = createMockGrammy();
		const result = await broadcast(mock.bot, [], 'hello', { delayMs: 0 });
		assert.equal(result.sent, 0);
		assert.equal(result.failed, 0);
		assert.equal(result.errors.length, 0);
	});
});
