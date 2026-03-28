import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createMockGrammy } from '../lib/mock_grammy.ts';
import { answerCallback } from './answer_callback.ts';

describe('answerCallback', () => {
	it('calls answerCallbackQuery with just callbackQueryId', async () => {
		const mock = createMockGrammy();
		await answerCallback(mock.bot, 'abc123');
		const call = mock.calls[0];
		assert.ok(call);
		assert.equal(call.method, 'answerCallbackQuery');
		const params = call.args[0] as Record<string, unknown>;
		assert.equal(params.callback_query_id, 'abc123');
		assert.equal(params.text, undefined);
		assert.equal(params.show_alert, undefined);
	});

	it('includes text when set', async () => {
		const mock = createMockGrammy();
		await answerCallback(mock.bot, 'id1', { text: 'Done!' });
		const call = mock.calls[0];
		assert.ok(call);
		const params = call.args[0] as Record<string, unknown>;
		assert.equal(params.text, 'Done!');
	});

	it('includes showAlert when set', async () => {
		const mock = createMockGrammy();
		await answerCallback(mock.bot, 'id1', { showAlert: true });
		const call = mock.calls[0];
		assert.ok(call);
		const params = call.args[0] as Record<string, unknown>;
		assert.equal(params.show_alert, true);
	});

	it('includes url when set', async () => {
		const mock = createMockGrammy();
		await answerCallback(mock.bot, 'id1', { url: 'https://example.com' });
		const call = mock.calls[0];
		assert.ok(call);
		const params = call.args[0] as Record<string, unknown>;
		assert.equal(params.url, 'https://example.com');
	});

	it('includes cacheTime when set', async () => {
		const mock = createMockGrammy();
		await answerCallback(mock.bot, 'id1', { cacheTime: 30 });
		const call = mock.calls[0];
		assert.ok(call);
		const params = call.args[0] as Record<string, unknown>;
		assert.equal(params.cache_time, 30);
	});
});
