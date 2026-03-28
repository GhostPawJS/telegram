import { strictEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { chatRef, messageRef, userRef } from './tool_ref.ts';

describe('entity ref builders', () => {
	it('chatRef builds a chat entity ref', () => {
		const ref = chatRef(12345, 'My Group');
		strictEqual(ref.type, 'chat');
		strictEqual(ref.id, 12345);
		strictEqual(ref.label, 'My Group');
	});

	it('chatRef works without label', () => {
		const ref = chatRef(12345);
		strictEqual(ref.label, undefined);
	});

	it('userRef builds a user entity ref', () => {
		const ref = userRef(99);
		strictEqual(ref.type, 'user');
		strictEqual(ref.id, 99);
	});

	it('messageRef builds a message entity ref', () => {
		const ref = messageRef(100, 42);
		strictEqual(ref.type, 'message');
		strictEqual(ref.id, 42);
		strictEqual(typeof ref.label, 'string');
	});
});
