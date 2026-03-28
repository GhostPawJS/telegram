import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createMockGrammy } from '../lib/mock_grammy.ts';
import { createStream } from './create_stream.ts';

describe('createStream', () => {
	it('single write + end() sends one message', async () => {
		const mock = createMockGrammy();
		const stream = createStream(mock.bot, { chatId: 1, debounceMs: 50 });
		stream.write('hello');
		await stream.end();
		const sends = mock.calls.filter((c) => c.method === 'sendMessage');
		assert.equal(sends.length, 1);
		assert.equal(sends[0]?.args[1], 'hello');
		assert.ok(stream.done);
	});

	it('multiple writes before debounce are batched into one call', async () => {
		const mock = createMockGrammy();
		const stream = createStream(mock.bot, { chatId: 1, debounceMs: 200 });
		stream.write('foo');
		stream.write(' bar');
		stream.write(' baz');
		await stream.end();
		const sends = mock.calls.filter((c) => c.method === 'sendMessage');
		assert.equal(sends.length, 1);
		assert.equal(sends[0]?.args[1], 'foo bar baz');
	});

	it('edit mode uses editMessageText when messageId provided', async () => {
		const mock = createMockGrammy();
		const stream = createStream(mock.bot, { chatId: 5, messageId: 42, debounceMs: 50 });
		stream.write('updated text');
		await stream.end();
		const edits = mock.calls.filter((c) => c.method === 'editMessageText');
		assert.equal(edits.length, 1);
		assert.equal(edits[0]?.args[0], 5);
		assert.equal(edits[0]?.args[1], 42);
		assert.equal(edits[0]?.args[2], 'updated text');
		assert.equal(mock.calls.filter((c) => c.method === 'sendMessage').length, 0);
	});

	it('overflow: text longer than maxLength splits into two messages', async () => {
		const mock = createMockGrammy();
		mock.setResponse('sendMessage', { ok: true, result: { message_id: 10 } });
		const longText = `${'a'.repeat(60)}\n${'b'.repeat(60)}`;
		const stream = createStream(mock.bot, { chatId: 2, maxLength: 64, debounceMs: 0 });
		stream.write(longText);
		await stream.end();
		const sends = mock.calls.filter((c) => c.method === 'sendMessage');
		assert.equal(sends.length, 2);
	});

	it('onError callback called on API failure', async () => {
		const mock = createMockGrammy();
		mock.setResponse('sendMessage', Promise.reject(new Error('API error')));
		const errors: Error[] = [];
		const stream = createStream(mock.bot, {
			chatId: 3,
			debounceMs: 0,
			onError: (err) => errors.push(err),
		});
		stream.write('test');
		await stream.end();
		assert.equal(errors.length, 1);
		assert.ok(errors[0]?.message.includes('API error'));
	});

	it('text getter returns accumulated content', () => {
		const mock = createMockGrammy();
		const stream = createStream(mock.bot, { chatId: 1 });
		stream.write('hello');
		stream.write(' world');
		assert.equal(stream.text, 'hello world');
	});

	it('done is false before end(), true after', async () => {
		const mock = createMockGrammy();
		const stream = createStream(mock.bot, { chatId: 1, debounceMs: 0 });
		assert.equal(stream.done, false);
		stream.write('x');
		await stream.end();
		assert.equal(stream.done, true);
	});
});
