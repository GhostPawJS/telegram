import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createMockGrammy } from '../lib/mock_grammy.ts';
import { downloadFile } from './download_file.ts';

describe('downloadFile', () => {
	it('calls getFile with correct file_id', async () => {
		const mock = createMockGrammy();
		mock.setResponse('getFile', { file_path: 'photos/file.jpg' });
		const fakeDownloader = async (_url: string, _dest: string) => 42;
		await downloadFile(mock.bot, 'abc123', '/tmp/out.jpg', fakeDownloader);
		const call = mock.calls[0];
		assert.ok(call !== undefined);
		assert.equal(call.method, 'getFile');
		const params = call.args[0] as Record<string, unknown>;
		assert.equal(params.file_id, 'abc123');
	});

	it('constructs URL containing bot token and file_path', async () => {
		const mock = createMockGrammy();
		mock.setResponse('getFile', { file_path: 'photos/file.jpg' });
		let capturedUrl = '';
		const fakeDownloader = async (url: string, _dest: string) => {
			capturedUrl = url;
			return 0;
		};
		await downloadFile(mock.bot, 'abc123', '/tmp/out.jpg', fakeDownloader);
		assert.ok(capturedUrl.includes(mock.bot.token));
		assert.ok(capturedUrl.includes('photos/file.jpg'));
	});

	it('returns { localPath, fileSize } correctly', async () => {
		const mock = createMockGrammy();
		mock.setResponse('getFile', { file_path: 'photos/file.jpg' });
		const fakeDownloader = async (_url: string, _dest: string) => 1234;
		const result = await downloadFile(mock.bot, 'abc123', '/tmp/out.jpg', fakeDownloader);
		assert.equal(result.localPath, '/tmp/out.jpg');
		assert.equal(result.fileSize, 1234);
	});

	it('propagates getFile rejection', async () => {
		const mock = createMockGrammy();
		mock.setResponse('getFile', Promise.reject(new Error('not found')));
		const fakeDownloader = async (_url: string, _dest: string) => 0;
		await assert.rejects(
			() => downloadFile(mock.bot, 'bad_id', '/tmp/out.jpg', fakeDownloader),
			/not found/,
		);
	});
});
