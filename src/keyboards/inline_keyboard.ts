import type { InlineButton, InlineKeyboardMarkup } from './types.ts';

/** Build an InlineKeyboardMarkup from a 2D array of buttons */
export function inlineKeyboard(buttons: InlineButton[][]): InlineKeyboardMarkup {
	return { inline_keyboard: buttons };
}

/** Callback button — triggers a callback query */
export function callbackButton(
	text: string,
	data: string,
): Extract<InlineButton, { callback_data: string }> {
	return { text, callback_data: data };
}

/** URL button — opens a URL in browser */
export function urlButton(text: string, url: string): Extract<InlineButton, { url: string }> {
	return { text, url };
}

/** Inline query button — switches to inline mode in current chat */
export function switchInlineCurrentButton(
	text: string,
	query = '',
): Extract<InlineButton, { switch_inline_query_current_chat: string }> {
	return { text, switch_inline_query_current_chat: query };
}

/** Inline query button — switches to inline mode and lets user choose a chat */
export function switchInlineButton(
	text: string,
	query = '',
): Extract<InlineButton, { switch_inline_query: string }> {
	return { text, switch_inline_query: query };
}

/** Web App button */
export function webAppButton(
	text: string,
	url: string,
): Extract<InlineButton, { web_app: { url: string } }> {
	return { text, web_app: { url } };
}
