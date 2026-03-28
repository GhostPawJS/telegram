import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { InputFile } from 'grammy';
import { createMockGrammy } from '../lib/mock_grammy.ts';
import { sendVoice } from './send_voice.ts';

describe('sendVoice', () => {
	it('calls sendVoice API with correct chat_id and voice as string file_id', async () => {
		const mock = createMockGrammy();
		mock.setResponse('sendVoice', { message_id: 1 });
		await sendVoice(mock.bot, 100, 'file_id_abc');
		const call = mock.calls[0];
		assert.ok(call !== undefined);
		assert.equal(call.method, 'sendVoice');
		const params = call.args[0] as Record<string, unknown>;
		assert.equal(params.chat_id, 100);
		assert.equal(params.voice, 'file_id_abc');
	});

	it('wraps Buffer in InputFile', async () => {
		const mock = createMockGrammy();
		mock.setResponse('sendVoice', { message_id: 1 });
		const buf = Buffer.from('voice');
		await sendVoice(mock.bot, 1, buf);
		const call = mock.calls[0];
		assert.ok(call !== undefined);
		const params = call.args[0] as Record<string, unknown>;
		assert.ok(params.voice instanceof InputFile);
	});

	it('wraps { url } in InputFile', async () => {
		const mock = createMockGrammy();
		mock.setResponse('sendVoice', { message_id: 1 });
		await sendVoice(mock.bot, 1, { url: 'https://example.com/voice.ogg' });
		const call = mock.calls[0];
		assert.ok(call !== undefined);
		const params = call.args[0] as Record<string, unknown>;
		assert.ok(params.voice instanceof InputFile);
	});

	it('forwards caption', async () => {
		const mock = createMockGrammy();
		mock.setResponse('sendVoice', { message_id: 1 });
		await sendVoice(mock.bot, 1, 'fid', { caption: 'hello' });
		const call = mock.calls[0];
		assert.ok(call !== undefined);
		const params = call.args[0] as Record<string, unknown>;
		assert.equal(params.caption, 'hello');
	});

	it('forwards parse_mode', async () => {
		const mock = createMockGrammy();
		mock.setResponse('sendVoice', { message_id: 1 });
		await sendVoice(mock.bot, 1, 'fid', { parseMode: 'HTML' });
		const call = mock.calls[0];
		assert.ok(call !== undefined);
		const params = call.args[0] as Record<string, unknown>;
		assert.equal(params.parse_mode, 'HTML');
	});

	it('forwards reply_to_message_id', async () => {
		const mock = createMockGrammy();
		mock.setResponse('sendVoice', { message_id: 1 });
		await sendVoice(mock.bot, 1, 'fid', { replyToMessageId: 42 });
		const call = mock.calls[0];
		assert.ok(call !== undefined);
		const params = call.args[0] as Record<string, unknown>;
		assert.equal(params.reply_to_message_id, 42);
	});

	it('returns { messageId } from API response', async () => {
		const mock = createMockGrammy();
		mock.setResponse('sendVoice', { message_id: 77 });
		const result = await sendVoice(mock.bot, 1, 'fid');
		assert.equal(result.messageId, 77);
	});
});
