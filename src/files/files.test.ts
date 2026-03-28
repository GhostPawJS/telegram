import { deepStrictEqual, ok, strictEqual } from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';

import type { TelegramDb } from '../database.ts';
import { TelegramNotFoundError } from '../errors.ts';
import { openTestDatabase } from '../lib/open-test-database.ts';
import { getFile } from './get_file.ts';
import { getFileBlob } from './get_file_blob.ts';
import { initFileTables } from './init_file_tables.ts';
import { listFiles } from './list_files.ts';
import { storeFileBlob } from './store_file_blob.ts';
import type { FileInput } from './types.ts';
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
	checksum: null,
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
			strictEqual(entry.checksum, null);
			strictEqual(entry.createdAt, 1000);
			strictEqual(entry.updatedAt, 1000);
		});

		it('idempotency: second call updates metadata and preserves created_at', () => {
			upsertFile(db, baseInput, 1000);
			const updated = upsertFile(
				db,
				{ ...baseInput, fileUniqueId: 'unique-001-v2', mimeType: 'image/png', fileSize: 99999 },
				2000,
			);

			strictEqual(updated.fileUniqueId, 'unique-001-v2');
			strictEqual(updated.mimeType, 'image/png');
			strictEqual(updated.fileSize, 99999);
			strictEqual(updated.createdAt, 1000);
			strictEqual(updated.updatedAt, 2000);
		});

		it('upsert does not overwrite an existing checksum', () => {
			upsertFile(db, baseInput, 1000);
			const data = Buffer.from('hello');
			storeFileBlob(db, 'file-001', data, 1500);

			// second upsert must not clear the checksum
			upsertFile(db, { ...baseInput, fileName: 'renamed.jpg' }, 2000);
			const entry = getFile(db, 'file-001');
			ok(entry?.checksum !== null, 'checksum must survive re-upsert');
		});
	});

	describe('getFile', () => {
		it('returns null for unknown fileId', () => {
			strictEqual(getFile(db, 'nonexistent'), null);
		});
	});

	describe('listFiles', () => {
		it('returns empty array with no rows', () => {
			strictEqual(listFiles(db).length, 0);
		});

		it('filters by type', () => {
			upsertFile(db, { ...baseInput, fileId: 'f1', type: 'photo' }, 1000);
			upsertFile(db, { ...baseInput, fileId: 'f2', type: 'document' }, 1001);
			upsertFile(db, { ...baseInput, fileId: 'f3', type: 'photo' }, 1002);

			const photos = listFiles(db, { type: 'photo' });
			strictEqual(photos.length, 2);
			ok(photos.every((e) => e.type === 'photo'));
		});

		it('filters by hasBlob: true returns only downloaded entries', () => {
			upsertFile(db, { ...baseInput, fileId: 'f1' }, 1000);
			upsertFile(db, { ...baseInput, fileId: 'f2' }, 1001);
			storeFileBlob(db, 'f1', Buffer.from('data'), 1500);

			const downloaded = listFiles(db, { hasBlob: true });
			strictEqual(downloaded.length, 1);
			strictEqual(downloaded[0]?.fileId, 'f1');
		});

		it('filters by hasBlob: false returns only pending entries', () => {
			upsertFile(db, { ...baseInput, fileId: 'f1' }, 1000);
			upsertFile(db, { ...baseInput, fileId: 'f2' }, 1001);
			storeFileBlob(db, 'f1', Buffer.from('data'), 1500);

			const pending = listFiles(db, { hasBlob: false });
			strictEqual(pending.length, 1);
			strictEqual(pending[0]?.fileId, 'f2');
		});

		it('filters by chatId', () => {
			upsertFile(db, { ...baseInput, fileId: 'f1', chatId: 100 }, 1000);
			upsertFile(db, { ...baseInput, fileId: 'f2', chatId: 200 }, 1001);
			upsertFile(db, { ...baseInput, fileId: 'f3', chatId: 100 }, 1002);

			const chat100 = listFiles(db, { chatId: 100 });
			strictEqual(chat100.length, 2);
			ok(chat100.every((e) => e.chatId === 100));
		});
	});

	describe('storeFileBlob', () => {
		it('stores bytes and sets checksum on the file entry', () => {
			upsertFile(db, baseInput, 1000);
			const data = Buffer.from('hello world');
			const entry = storeFileBlob(db, 'file-001', data, 2000);

			ok(entry.checksum !== null);
			strictEqual(entry.checksum?.length, 64); // SHA-256 hex = 64 chars
			strictEqual(entry.updatedAt, 2000);
		});

		it('deduplication: identical bytes stored only once in file_blobs', () => {
			upsertFile(db, { ...baseInput, fileId: 'f1' }, 1000);
			upsertFile(db, { ...baseInput, fileId: 'f2' }, 1001);
			const data = Buffer.from('same content');

			const e1 = storeFileBlob(db, 'f1', data, 1500);
			const e2 = storeFileBlob(db, 'f2', data, 1600);

			// Both file entries point to the same blob row
			strictEqual(e1.checksum, e2.checksum);

			// Only one blob row exists
			const count = (db.prepare('SELECT COUNT(*) as n FROM file_blobs').get() as { n: number }).n;
			strictEqual(count, 1);
		});

		it('different content produces different checksums', () => {
			upsertFile(db, { ...baseInput, fileId: 'f1' }, 1000);
			upsertFile(db, { ...baseInput, fileId: 'f2' }, 1001);

			const e1 = storeFileBlob(db, 'f1', Buffer.from('content-a'), 1500);
			const e2 = storeFileBlob(db, 'f2', Buffer.from('content-b'), 1600);

			ok(e1.checksum !== e2.checksum);
		});

		it('throws TelegramNotFoundError for unknown fileId', () => {
			let threw = false;
			try {
				storeFileBlob(db, 'nonexistent', Buffer.from('data'));
			} catch (err) {
				threw = true;
				ok(err instanceof TelegramNotFoundError);
			}
			ok(threw);
		});
	});

	describe('getFileBlob', () => {
		it('returns null when file has not been downloaded', () => {
			upsertFile(db, baseInput, 1000);
			strictEqual(getFileBlob(db, 'file-001'), null);
		});

		it('returns null for unknown fileId', () => {
			strictEqual(getFileBlob(db, 'nonexistent'), null);
		});

		it('returns the exact bytes that were stored', () => {
			upsertFile(db, baseInput, 1000);
			const original = Buffer.from('exact bytes here');
			storeFileBlob(db, 'file-001', original, 2000);

			const retrieved = getFileBlob(db, 'file-001');
			ok(retrieved !== null);
			deepStrictEqual(retrieved, original);
		});

		it('two file_ids sharing a blob both return the correct bytes', () => {
			upsertFile(db, { ...baseInput, fileId: 'f1' }, 1000);
			upsertFile(db, { ...baseInput, fileId: 'f2' }, 1001);
			const data = Buffer.from('shared content');
			storeFileBlob(db, 'f1', data, 1500);
			storeFileBlob(db, 'f2', data, 1600);

			deepStrictEqual(getFileBlob(db, 'f1'), data);
			deepStrictEqual(getFileBlob(db, 'f2'), data);
		});
	});
});
