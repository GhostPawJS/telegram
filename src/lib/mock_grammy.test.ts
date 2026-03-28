import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createMockGrammy } from './mock_grammy.ts';

describe('createMockGrammy', () => {
	it('records method name and args via call()', async () => {
		const mock = createMockGrammy();
		await mock.bot.call('sendMessage', 42, 'hello');
		assert.equal(mock.calls.length, 1);
		assert.equal(mock.calls[0]?.method, 'sendMessage');
		assert.deepEqual(mock.calls[0]?.args, [42, 'hello']);
	});

	it('records method name and args via api proxy', async () => {
		const mock = createMockGrammy();
		// biome-ignore lint/style/noNonNullAssertion: test access to proxy
		const fn = mock.bot.api.sendMessage!;
		await fn(42, 'hello');
		assert.equal(mock.calls.length, 1);
		assert.equal(mock.calls[0]?.method, 'sendMessage');
	});

	it('returns { ok: true } by default', async () => {
		const mock = createMockGrammy();
		const result = await mock.bot.call('sendMessage', 1, 'test');
		assert.deepEqual(result, { ok: true });
	});

	it('returns custom response via setResponse', async () => {
		const mock = createMockGrammy();
		mock.setResponse('sendMessage', { ok: true, result: { message_id: 99 } });
		const result = await mock.bot.call('sendMessage', 1, 'test');
		assert.deepEqual(result, { ok: true, result: { message_id: 99 } });
	});

	it('records multiple calls across different methods', async () => {
		const mock = createMockGrammy();
		await mock.bot.call('sendMessage', 1, 'a');
		await mock.bot.call('editMessageText', 1, 10, 'b');
		assert.equal(mock.calls.length, 2);
		assert.equal(mock.calls[0]?.method, 'sendMessage');
		assert.equal(mock.calls[1]?.method, 'editMessageText');
	});

	it('reset() clears calls', async () => {
		const mock = createMockGrammy();
		await mock.bot.call('sendMessage', 1, 'x');
		mock.reset();
		assert.equal(mock.calls.length, 0);
	});

	it('reset() clears custom responses', async () => {
		const mock = createMockGrammy();
		mock.setResponse('sendMessage', { ok: false });
		mock.reset();
		const result = await mock.bot.call('sendMessage', 1, 'x');
		assert.deepEqual(result, { ok: true });
	});

	it('bot has token field', () => {
		const mock = createMockGrammy();
		assert.equal(mock.bot.token, 'mock:token');
	});
});
