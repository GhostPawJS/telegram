import { ok, strictEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createMockGrammy } from '../lib/mock_grammy.ts';
import { markdownToHtml } from '../render.ts';
import { createStream } from '../write.ts';
import { streamProgressiveResponses } from './stream-progressive-responses.ts';

describe('streamProgressiveResponses skill', () => {
	it('skill metadata', () => {
		strictEqual(typeof streamProgressiveResponses.name, 'string');
		ok(streamProgressiveResponses.name.length > 0);
		strictEqual(typeof streamProgressiveResponses.description, 'string');
		ok(streamProgressiveResponses.description.length > 0);
		strictEqual(typeof streamProgressiveResponses.content, 'string');
		ok(streamProgressiveResponses.content.length > 0);
	});

	it('basic workflow: write placeholder then real content — one sendMessage', async () => {
		const mock = createMockGrammy();
		const stream = createStream(mock.bot, { chatId: 1, debounceMs: 0 });
		stream.write('Thinking...');
		await stream.end();

		const sends = mock.calls.filter((c) => c.method === 'sendMessage');
		strictEqual(sends.length, 1);
		const call = sends[0];
		ok(call !== undefined);
		// createStream calls bot.call('sendMessage', chatId, text, opts) — args[1] is text
		const text = call.args[1] as string;
		strictEqual(text, 'Thinking...');
	});

	it('multiple chunks are batched into one call', async () => {
		const mock = createMockGrammy();
		const stream = createStream(mock.bot, { chatId: 1, debounceMs: 300 });
		stream.write('chunk one');
		stream.write(' chunk two');
		stream.write(' chunk three');
		await stream.end();

		const sends = mock.calls.filter((c) => c.method === 'sendMessage');
		strictEqual(sends.length, 1);
	});

	it('edit mode: provide messageId → uses editMessageText not sendMessage', async () => {
		const mock = createMockGrammy();
		const stream = createStream(mock.bot, { chatId: 1, messageId: 42, debounceMs: 0 });
		stream.write('edited content');
		await stream.end();

		const edits = mock.calls.filter((c) => c.method === 'editMessageText');
		const sends = mock.calls.filter((c) => c.method === 'sendMessage');
		strictEqual(edits.length, 1);
		strictEqual(sends.length, 0);
	});

	it('send mode: no messageId → sendMessage called', async () => {
		const mock = createMockGrammy();
		const stream = createStream(mock.bot, { chatId: 1, debounceMs: 0 });
		stream.write('new message');
		await stream.end();

		const sends = mock.calls.filter((c) => c.method === 'sendMessage');
		const edits = mock.calls.filter((c) => c.method === 'editMessageText');
		ok(sends.length > 0);
		strictEqual(edits.length, 0);
	});

	it('parseMode is forwarded to the API call', async () => {
		const mock = createMockGrammy();
		const stream = createStream(mock.bot, { chatId: 1, debounceMs: 0, parseMode: 'HTML' });
		stream.write('<b>formatted</b>');
		await stream.end();

		const sends = mock.calls.filter((c) => c.method === 'sendMessage');
		ok(sends.length > 0);
		const call = sends[0];
		ok(call !== undefined);
		// createStream calls bot.call('sendMessage', chatId, text, opts) — args[2] is opts
		const opts = call.args[2] as Record<string, unknown>;
		strictEqual(opts?.parse_mode, 'HTML');
	});

	it('render.markdownToHtml integration — output is passed to stream', async () => {
		const mock = createMockGrammy();
		const html = markdownToHtml('**bold**');
		ok(html.includes('<b>bold</b>'));

		const stream = createStream(mock.bot, { chatId: 1, debounceMs: 0, parseMode: 'HTML' });
		stream.write(html);
		await stream.end();

		const sends = mock.calls.filter((c) => c.method === 'sendMessage');
		ok(sends.length > 0);
		const call = sends[0];
		ok(call !== undefined);
		// createStream calls bot.call('sendMessage', chatId, text, opts) — args[1] is text
		const sentText = call.args[1] as string;
		ok(sentText.includes('<b>bold</b>'));
	});

	it('overflow: text longer than maxLength splits into two messages', async () => {
		const mock = createMockGrammy();
		// maxLength: 50, write 60+ chars with a space so chainOverflow can split
		const longText = 'abcdefghijklmnopqrstuvwxyz abcdefghijklmnopqrstuvwxyz12345';
		ok(longText.length > 50);

		const stream = createStream(mock.bot, { chatId: 1, debounceMs: 0, maxLength: 50 });
		stream.write(longText);
		await stream.end();

		const sends = mock.calls.filter((c) => c.method === 'sendMessage');
		strictEqual(sends.length, 2);
	});

	it('onError: API failure calls onError but does not throw', async () => {
		const mock = createMockGrammy();
		mock.setResponse('sendMessage', Promise.reject(new Error('Telegram error')));

		let errorCalled = false;
		const stream = createStream(mock.bot, {
			chatId: 1,
			debounceMs: 0,
			onError: () => {
				errorCalled = true;
			},
		});
		stream.write('will fail');
		await stream.end();

		ok(errorCalled);
		ok(stream.done);
	});

	it('stream.text reflects accumulated content before end()', () => {
		const mock = createMockGrammy();
		const stream = createStream(mock.bot, { chatId: 1, debounceMs: 300 });
		stream.write('part one');
		stream.write(' part two');
		stream.write(' part three');

		strictEqual(stream.text, 'part one part two part three');
	});

	it('stream.done is false before end() and true after', async () => {
		const mock = createMockGrammy();
		const stream = createStream(mock.bot, { chatId: 1, debounceMs: 0 });
		stream.write('test');

		strictEqual(stream.done, false);
		await stream.end();
		strictEqual(stream.done, true);
	});

	it('do not write after end() — graceful: second write after end does not crash', async () => {
		const mock = createMockGrammy();
		const stream = createStream(mock.bot, { chatId: 1, debounceMs: 0 });
		stream.write('first');
		await stream.end();

		// The skill says "do not call write after end" — verify the system handles it gracefully
		let threw = false;
		try {
			stream.write('after end');
		} catch {
			threw = true;
		}

		ok(!threw);
		ok(stream.done);
	});

	it('debounceMs guidance: low debounceMs leads to more API calls (verify)', async () => {
		const mock = createMockGrammy();
		// With debounceMs:0 and a tick between each write, each write flushes independently
		mock.setResponse('sendMessage', { ok: true, result: { message_id: 1 } });

		const stream = createStream(mock.bot, { chatId: 1, debounceMs: 0 });

		stream.write('one');
		await new Promise((r) => setTimeout(r, 10));

		stream.write(' two');
		await new Promise((r) => setTimeout(r, 10));

		stream.write(' three');
		await new Promise((r) => setTimeout(r, 10));

		await stream.end();

		// With debounceMs:0, each write followed by a tick triggers a separate flush
		const calls = mock.calls.filter(
			(c) => c.method === 'sendMessage' || c.method === 'editMessageText',
		);
		ok(calls.length > 1, `expected multiple API calls, got ${calls.length}`);
	});
});
