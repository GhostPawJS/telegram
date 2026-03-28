import { ok, strictEqual } from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';

import type { TelegramDb } from '../database.ts';
import { initFileTables, upsertFile } from '../files/index.ts';
import { createMockGrammy } from '../lib/mock_grammy.ts';
import { openTestDatabase } from '../lib/open-test-database.ts';
import { downloadFile } from './download_file.ts';

describe('downloadFile (executor)', () => {
	let db: TelegramDb;

	beforeEach(async () => {
		db = await openTestDatabase();
		initFileTables(db);
	});

	it('calls getFile with the correct file_id', async () => {
		const mock = createMockGrammy();
		mock.setResponse('getFile', { file_path: 'photos/file.jpg' });
		upsertFile(
			db,
			{
				fileId: 'abc',
				fileUniqueId: 'u1',
				chatId: null,
				messageId: null,
				type: 'photo',
				mimeType: null,
				fileName: null,
				fileSize: null,
				width: null,
				height: null,
				duration: null,
				checksum: null,
			},
			1000,
		);

		await downloadFile(mock.bot, db, 'abc', async () => Buffer.from('bytes'));

		const call = mock.calls.find((c) => c.method === 'getFile');
		ok(call !== undefined);
		strictEqual((call.args[0] as Record<string, unknown>)?.file_id, 'abc');
	});

	it('constructs the Telegram CDN URL from bot token and file_path', async () => {
		const mock = createMockGrammy();
		mock.setResponse('getFile', { file_path: 'photos/img.jpg' });
		upsertFile(
			db,
			{
				fileId: 'abc',
				fileUniqueId: 'u1',
				chatId: null,
				messageId: null,
				type: 'photo',
				mimeType: null,
				fileName: null,
				fileSize: null,
				width: null,
				height: null,
				duration: null,
				checksum: null,
			},
			1000,
		);

		let capturedUrl = '';
		await downloadFile(mock.bot, db, 'abc', async (url) => {
			capturedUrl = url;
			return Buffer.from('data');
		});

		ok(capturedUrl.includes(mock.bot.token), 'URL must contain bot token');
		ok(capturedUrl.includes('photos/img.jpg'), 'URL must contain file_path');
	});

	it('stores bytes in SQLite and returns FileEntry with checksum set', async () => {
		const mock = createMockGrammy();
		mock.setResponse('getFile', { file_path: 'docs/file.pdf' });
		upsertFile(
			db,
			{
				fileId: 'abc',
				fileUniqueId: 'u1',
				chatId: null,
				messageId: null,
				type: 'document',
				mimeType: null,
				fileName: null,
				fileSize: null,
				width: null,
				height: null,
				duration: null,
				checksum: null,
			},
			1000,
		);

		const content = Buffer.from('pdf content here');
		const entry = await downloadFile(mock.bot, db, 'abc', async () => content);

		ok(entry.checksum !== null, 'checksum must be set after download');
		strictEqual(entry.checksum?.length, 64);
		strictEqual(entry.fileId, 'abc');
	});

	it('propagates getFile API rejection', async () => {
		const mock = createMockGrammy();
		mock.setResponse('getFile', Promise.reject(new Error('file not found')));
		upsertFile(
			db,
			{
				fileId: 'abc',
				fileUniqueId: 'u1',
				chatId: null,
				messageId: null,
				type: 'photo',
				mimeType: null,
				fileName: null,
				fileSize: null,
				width: null,
				height: null,
				duration: null,
				checksum: null,
			},
			1000,
		);

		let threw = false;
		try {
			await downloadFile(mock.bot, db, 'abc', async () => Buffer.from(''));
		} catch (err) {
			threw = true;
			ok((err as Error).message.includes('file not found'));
		}
		ok(threw);
	});
});
