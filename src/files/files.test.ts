import { strictEqual, throws } from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';

import type { TelegramDb } from '../database.ts';
import { TelegramNotFoundError, TelegramStateError } from '../errors.ts';
import { openTestDatabase } from '../lib/open-test-database.ts';
import { downloadFile } from './download_file.ts';
import { getFile } from './get_file.ts';
import { initFileTables } from './init_file_tables.ts';
import { listFiles } from './list_files.ts';
import type { FileInput } from './types.ts';
import { updateStorageStatus } from './update_storage_status.ts';
import { upsertFile } from './upsert_file.ts';

const baseInput: FileInput = {
	fileId: 'file-001',
	fileUniqueId: 'unique-001',
	chatId: 100,
	messageId: 200,
	type: 'photo',
	mimeType: 'image/jpeg',
	fileName: 'photo.jpg',
	fileSize: 12345,
	width: 800,
	height: 600,
	duration: null,
	localPath: null,
	localHash: null,
	storageStatus: 'remote_only',
	downloadedAt: null,
};

describe('files module', () => {
	let db: TelegramDb;

	beforeEach(async () => {
		db = await openTestDatabase();
		initFileTables(db);
	});

	describe('upsertFile', () => {
		it('creates a file entry with correct fields', () => {
			const entry = upsertFile(db, baseInput, 1000);

			strictEqual(entry.fileId, 'file-001');
			strictEqual(entry.fileUniqueId, 'unique-001');
			strictEqual(entry.chatId, 100);
			strictEqual(entry.messageId, 200);
			strictEqual(entry.type, 'photo');
			strictEqual(entry.mimeType, 'image/jpeg');
			strictEqual(entry.fileName, 'photo.jpg');
			strictEqual(entry.fileSize, 12345);
			strictEqual(entry.width, 800);
			strictEqual(entry.height, 600);
			strictEqual(entry.duration, null);
			strictEqual(entry.localPath, null);
			strictEqual(entry.localHash, null);
			strictEqual(entry.storageStatus, 'remote_only');
			strictEqual(entry.downloadedAt, null);
			strictEqual(entry.createdAt, 1000);
			strictEqual(entry.updatedAt, 1000);
		});

		it('idempotency: second call updates metadata and preserves created_at', () => {
			upsertFile(db, baseInput, 1000);

			const updated = upsertFile(
				db,
				{
					...baseInput,
					fileUniqueId: 'unique-001-v2',
					mimeType: 'image/png',
					fileName: 'photo_updated.png',
					fileSize: 99999,
				},
				2000,
			);

			strictEqual(updated.fileUniqueId, 'unique-001-v2');
			strictEqual(updated.mimeType, 'image/png');
			strictEqual(updated.fileName, 'photo_updated.png');
			strictEqual(updated.fileSize, 99999);
			strictEqual(updated.createdAt, 1000);
			strictEqual(updated.updatedAt, 2000);
		});
	});

	describe('getFile', () => {
		it('returns null for unknown fileId', () => {
			const result = getFile(db, 'nonexistent');
			strictEqual(result, null);
		});
	});

	describe('listFiles', () => {
		it('returns empty array with no rows', () => {
			const results = listFiles(db);
			strictEqual(results.length, 0);
		});

		it('filters by type', () => {
			upsertFile(db, { ...baseInput, fileId: 'f1', type: 'photo' }, 1000);
			upsertFile(db, { ...baseInput, fileId: 'f2', type: 'document' }, 1001);
			upsertFile(db, { ...baseInput, fileId: 'f3', type: 'photo' }, 1002);

			const photos = listFiles(db, { type: 'photo' });
			strictEqual(photos.length, 2);
			strictEqual(
				photos.every((e) => e.type === 'photo'),
				true,
			);
		});

		it('filters by storageStatus', () => {
			upsertFile(db, { ...baseInput, fileId: 'f1', storageStatus: 'remote_only' }, 1000);
			upsertFile(db, { ...baseInput, fileId: 'f2', storageStatus: 'downloaded' }, 1001);
			upsertFile(db, { ...baseInput, fileId: 'f3', storageStatus: 'downloaded' }, 1002);

			const downloaded = listFiles(db, { storageStatus: 'downloaded' });
			strictEqual(downloaded.length, 2);
			strictEqual(
				downloaded.every((e) => e.storageStatus === 'downloaded'),
				true,
			);
		});

		it('filters by chatId', () => {
			upsertFile(db, { ...baseInput, fileId: 'f1', chatId: 100 }, 1000);
			upsertFile(db, { ...baseInput, fileId: 'f2', chatId: 200 }, 1001);
			upsertFile(db, { ...baseInput, fileId: 'f3', chatId: 100 }, 1002);

			const chat100 = listFiles(db, { chatId: 100 });
			strictEqual(chat100.length, 2);
			strictEqual(
				chat100.every((e) => e.chatId === 100),
				true,
			);
		});
	});

	describe('updateStorageStatus', () => {
		it('sets downloaded_at when status is downloaded', () => {
			upsertFile(db, baseInput, 1000);
			const entry = updateStorageStatus(
				db,
				'file-001',
				'downloaded',
				'/tmp/file.jpg',
				'abc123',
				2000,
			);

			strictEqual(entry.storageStatus, 'downloaded');
			strictEqual(entry.localPath, '/tmp/file.jpg');
			strictEqual(entry.localHash, 'abc123');
			strictEqual(entry.downloadedAt, 2000);
			strictEqual(entry.updatedAt, 2000);
		});

		it('sets downloaded_at to null when status is failed', () => {
			upsertFile(db, baseInput, 1000);
			// First mark as downloaded
			updateStorageStatus(db, 'file-001', 'downloaded', '/tmp/file.jpg', 'abc123', 2000);
			// Then mark as failed
			const entry = updateStorageStatus(db, 'file-001', 'failed', null, null, 3000);

			strictEqual(entry.storageStatus, 'failed');
			strictEqual(entry.downloadedAt, null);
			strictEqual(entry.updatedAt, 3000);
		});

		it('throws TelegramNotFoundError for unknown fileId', () => {
			throws(
				() => updateStorageStatus(db, 'nonexistent', 'downloaded'),
				(err: unknown) => err instanceof TelegramNotFoundError,
			);
		});
	});

	describe('downloadFile', () => {
		it('throws TelegramStateError', async () => {
			await upsertFile(db, baseInput, 1000);
			let threw = false;
			try {
				await downloadFile(db, null, 'file-001', '/tmp/out.jpg');
			} catch (err) {
				threw = true;
				strictEqual(err instanceof TelegramStateError, true);
			}
			strictEqual(threw, true);
		});
	});
});
