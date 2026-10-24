import assert from 'node:assert/strict';
import { it } from 'node:test';
import { createInitializedTelegramDb } from '../lib/test-db.ts';
import { normalizeMessage } from '../normalize/normalize_message.ts';
import { applyEdit } from './apply_edit.ts';
import { insertMessage } from './insert_message.ts';
import { searchMessages } from './search_messages.ts';

it('search replaces old text after local edits and clears removed text', async () => {
	const db = await createInitializedTelegramDb();
	try {
		insertMessage(
			db,
			normalizeMessage(
				{ message_id: 1, date: 1, chat: { id: 123, type: 'private' }, text: 'oldword' },
				'in',
				1,
			),
		);
		applyEdit(db, 123, 1, { text: 'newword' });
		assert.equal(searchMessages(db, 123, 'newword').length, 1);
		assert.equal(searchMessages(db, 123, 'oldword').length, 0);
		applyEdit(db, 123, 1, { text: null });
		assert.equal(searchMessages(db, 123, 'newword').length, 0);
	} finally {
		db.close();
	}
});
