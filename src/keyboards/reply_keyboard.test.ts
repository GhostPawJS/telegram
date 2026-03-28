import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
	contactButton,
	forceReply,
	keyboardButton,
	locationButton,
	removeKeyboard,
	replyKeyboard,
} from './reply_keyboard.ts';

describe('replyKeyboard', () => {
	it('produces keyboard array', () => {
		const btn = keyboardButton('Hello');
		const result = replyKeyboard([[btn]]);
		assert.deepEqual(result, { keyboard: [[{ text: 'Hello' }]] });
	});

	it('sets resize_keyboard from opts.resize', () => {
		const result = replyKeyboard([[keyboardButton('A')]], { resize: true });
		assert.equal(result.resize_keyboard, true);
	});

	it('sets one_time_keyboard from opts.oneTime', () => {
		const result = replyKeyboard([[keyboardButton('A')]], { oneTime: true });
		assert.equal(result.one_time_keyboard, true);
	});

	it('sets input_field_placeholder from opts.placeholder', () => {
		const result = replyKeyboard([[keyboardButton('A')]], { placeholder: 'Type here...' });
		assert.equal(result.input_field_placeholder, 'Type here...');
	});

	it('sets selective from opts.selective', () => {
		const result = replyKeyboard([[keyboardButton('A')]], { selective: true });
		assert.equal(result.selective, true);
	});

	it('sets is_persistent from opts.persistent', () => {
		const result = replyKeyboard([[keyboardButton('A')]], { persistent: true });
		assert.equal(result.is_persistent, true);
	});
});

describe('removeKeyboard', () => {
	it('returns { remove_keyboard: true }', () => {
		assert.deepEqual(removeKeyboard(), { remove_keyboard: true });
	});

	it('returns { remove_keyboard: true, selective: true } when selective=true', () => {
		assert.deepEqual(removeKeyboard(true), { remove_keyboard: true, selective: true });
	});
});

describe('forceReply', () => {
	it('returns { force_reply: true }', () => {
		assert.deepEqual(forceReply(), { force_reply: true });
	});

	it('sets input_field_placeholder when placeholder provided', () => {
		const result = forceReply({ placeholder: 'Enter text' });
		assert.equal(result.force_reply, true);
		assert.equal(result.input_field_placeholder, 'Enter text');
	});

	it('sets selective when provided', () => {
		const result = forceReply({ selective: true });
		assert.equal(result.selective, true);
	});
});

describe('keyboardButton', () => {
	it('returns { text }', () => {
		assert.deepEqual(keyboardButton('Hello'), { text: 'Hello' });
	});
});

describe('contactButton', () => {
	it('returns { text, request_contact: true }', () => {
		assert.deepEqual(contactButton('Share'), { text: 'Share', request_contact: true });
	});
});

describe('locationButton', () => {
	it('returns { text, request_location: true }', () => {
		assert.deepEqual(locationButton('Send location'), {
			text: 'Send location',
			request_location: true,
		});
	});
});
