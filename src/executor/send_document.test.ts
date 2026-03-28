import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { InputFile } from 'grammy';
import { createMockGrammy } from '../lib/mock_grammy.ts';
import { sendDocument } from './send_document.ts';

describe('sendDocument', () => {
	it('calls sendDocument API with correct chat_id and document as string file_id', async () => {
		const mock = createMockGrammy();
		mock.setResponse('sendDocument', { message_id: 1 });
		await sendDocument(mock.bot, 100, 'file_id_abc');
		const call = mock.calls[0];
		assert.ok(call !== undefined);
		assert.equal(call.method, 'sendDocument');
		const params = call.args[0] as Record<string, unknown>;
		assert.equal(params.chat_id, 100);
		assert.equal(params.document, 'file_id_abc');
	});

	it('wraps Buffer in InputFile', async () => {
		const mock = createMockGrammy();
		mock.setResponse('sendDocument', { message_id: 1 });
		const buf = Buffer.from('doc');
		await sendDocument(mock.bot, 1, buf);
		const call = mock.calls[0];
		assert.ok(call !== undefined);
		const params = call.args[0] as Record<string, unknown>;
		assert.ok(params.document instanceof InputFile);
	});

	it('wraps { url } in InputFile', async () => {
		const mock = createMockGrammy();
		mock.setResponse('sendDocument', { message_id: 1 });
		await sendDocument(mock.bot, 1, { url: 'https://example.com/doc.pdf' });
		const call = mock.calls[0];
		assert.ok(call !== undefined);
		const params = call.args[0] as Record<string, unknown>;
		assert.ok(params.document instanceof InputFile);
	});

	it('forwards caption', async () => {
		const mock = createMockGrammy();
		mock.setResponse('sendDocument', { message_id: 1 });
		await sendDocument(mock.bot, 1, 'fid', { caption: 'hello' });
		const call = mock.calls[0];
		assert.ok(call !== undefined);
		const params = call.args[0] as Record<string, unknown>;
		assert.equal(params.caption, 'hello');
	});

	it('forwards parse_mode', async () => {
		const mock = createMockGrammy();
		mock.setResponse('sendDocument', { message_id: 1 });
		await sendDocument(mock.bot, 1, 'fid', { parseMode: 'HTML' });
		const call = mock.calls[0];
		assert.ok(call !== undefined);
		const params = call.args[0] as Record<string, unknown>;
		assert.equal(params.parse_mode, 'HTML');
	});

	it('forwards reply_to_message_id', async () => {
		const mock = createMockGrammy();
		mock.setResponse('sendDocument', { message_id: 1 });
		await sendDocument(mock.bot, 1, 'fid', { replyToMessageId: 42 });
		const call = mock.calls[0];
		assert.ok(call !== undefined);
		const params = call.args[0] as Record<string, unknown>;
		assert.equal(params.reply_to_message_id, 42);
	});

	it('returns { messageId } from API response', async () => {
		const mock = createMockGrammy();
		mock.setResponse('sendDocument', { message_id: 77 });
		const result = await sendDocument(mock.bot, 1, 'fid');
		assert.equal(result.messageId, 77);
	});
});
