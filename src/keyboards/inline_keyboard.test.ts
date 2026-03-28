import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
	callbackButton,
	inlineKeyboard,
	switchInlineButton,
	switchInlineCurrentButton,
	urlButton,
	webAppButton,
} from './inline_keyboard.ts';

describe('inlineKeyboard', () => {
	it('produces correct inline_keyboard structure', () => {
		const cb = callbackButton('Click', 'action');
		const result = inlineKeyboard([[cb]]);
		assert.deepEqual(result, { inline_keyboard: [[{ text: 'Click', callback_data: 'action' }]] });
	});

	it('multiple rows: 2x2 grid has correct shape', () => {
		const btn1 = callbackButton('A', 'a');
		const btn2 = callbackButton('B', 'b');
		const btn3 = callbackButton('C', 'c');
		const btn4 = callbackButton('D', 'd');
		const result = inlineKeyboard([
			[btn1, btn2],
			[btn3, btn4],
		]);
		assert.equal(result.inline_keyboard.length, 2);
		assert.equal(result.inline_keyboard[0]?.length, 2);
		assert.equal(result.inline_keyboard[1]?.length, 2);
	});
});

describe('callbackButton', () => {
	it('has callback_data', () => {
		const btn = callbackButton('Label', 'my_data');
		assert.equal(btn.text, 'Label');
		assert.equal(btn.callback_data, 'my_data');
	});
});

describe('urlButton', () => {
	it('has url', () => {
		const btn = urlButton('Open', 'https://example.com');
		assert.equal(btn.text, 'Open');
		assert.equal(btn.url, 'https://example.com');
	});
});

describe('switchInlineCurrentButton', () => {
	it('has switch_inline_query_current_chat', () => {
		const btn = switchInlineCurrentButton('Search', 'query');
		assert.equal(btn.text, 'Search');
		assert.equal(btn.switch_inline_query_current_chat, 'query');
	});

	it('defaults query to empty string', () => {
		const btn = switchInlineCurrentButton('Search');
		assert.equal(btn.switch_inline_query_current_chat, '');
	});
});

describe('switchInlineButton', () => {
	it('has switch_inline_query', () => {
		const btn = switchInlineButton('Share', 'query');
		assert.equal(btn.text, 'Share');
		assert.equal(btn.switch_inline_query, 'query');
	});

	it('defaults query to empty string', () => {
		const btn = switchInlineButton('Share');
		assert.equal(btn.switch_inline_query, '');
	});
});

describe('webAppButton', () => {
	it('has web_app.url', () => {
		const btn = webAppButton('Launch', 'https://app.example.com');
		assert.equal(btn.text, 'Launch');
		assert.equal(btn.web_app.url, 'https://app.example.com');
	});
});
