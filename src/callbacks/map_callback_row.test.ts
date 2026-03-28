import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { mapCallbackRow } from './map_callback_row.ts';
import type { CallbackRow } from './types.ts';

describe('mapCallbackRow', () => {
	it('maps snake_case fields to camelCase', () => {
		const row: CallbackRow = {
			callback_id: 'cb-1',
			chat_id: 100,
			message_id: 50,
			user_id: 200,
			data: 'action:vote',
			handler: 'vote_handler',
			payload: null,
			answered_at: null,
			expires_at: null,
			created_at: 1700000000000,
		};

		const entry = mapCallbackRow(row);

		assert.equal(entry.callbackId, 'cb-1');
		assert.equal(entry.chatId, 100);
		assert.equal(entry.messageId, 50);
		assert.equal(entry.userId, 200);
		assert.equal(entry.data, 'action:vote');
		assert.equal(entry.handler, 'vote_handler');
		assert.equal(entry.payload, null);
		assert.equal(entry.answeredAt, null);
		assert.equal(entry.expiresAt, null);
		assert.equal(entry.createdAt, 1700000000000);
	});

	it('parses payload JSON', () => {
		const row: CallbackRow = {
			callback_id: 'cb-2',
			chat_id: 100,
			message_id: 51,
			user_id: 201,
			data: null,
			handler: null,
			payload: '{"option":3,"confirmed":true}',
			answered_at: 1700000001000,
			expires_at: 1700003600000,
			created_at: 1700000000000,
		};

		const entry = mapCallbackRow(row);

		assert.deepEqual(entry.payload, { option: 3, confirmed: true });
		assert.equal(entry.answeredAt, 1700000001000);
		assert.equal(entry.expiresAt, 1700003600000);
	});

	it('returns null payload when field is null', () => {
		const row: CallbackRow = {
			callback_id: 'cb-3',
			chat_id: 100,
			message_id: 52,
			user_id: 202,
			data: null,
			handler: null,
			payload: null,
			answered_at: null,
			expires_at: null,
			created_at: 1700000000000,
		};

		const entry = mapCallbackRow(row);
		assert.equal(entry.payload, null);
	});
});
