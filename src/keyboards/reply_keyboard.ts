import type {
	ForceReply,
	KeyboardButton,
	ReplyKeyboardMarkup,
	ReplyKeyboardRemove,
} from './types.ts';

export interface ReplyKeyboardOpts {
	resize?: boolean;
	oneTime?: boolean;
	placeholder?: string;
	selective?: boolean;
	persistent?: boolean;
}

/** Build a ReplyKeyboardMarkup */
export function replyKeyboard(
	buttons: KeyboardButton[][],
	opts?: ReplyKeyboardOpts,
): ReplyKeyboardMarkup {
	const markup: ReplyKeyboardMarkup = { keyboard: buttons };
	if (opts?.resize !== undefined) markup.resize_keyboard = opts.resize;
	if (opts?.oneTime !== undefined) markup.one_time_keyboard = opts.oneTime;
	if (opts?.placeholder !== undefined) markup.input_field_placeholder = opts.placeholder;
	if (opts?.selective !== undefined) markup.selective = opts.selective;
	if (opts?.persistent !== undefined) markup.is_persistent = opts.persistent;
	return markup;
}

/** Remove keyboard */
export function removeKeyboard(selective?: boolean): ReplyKeyboardRemove {
	if (selective === true) return { remove_keyboard: true, selective: true };
	return { remove_keyboard: true };
}

/** Force reply */
export function forceReply(opts?: { placeholder?: string; selective?: boolean }): ForceReply {
	const reply: ForceReply = { force_reply: true };
	if (opts?.placeholder !== undefined) reply.input_field_placeholder = opts.placeholder;
	if (opts?.selective !== undefined) reply.selective = opts.selective;
	return reply;
}

/** Plain text button */
export function keyboardButton(text: string): KeyboardButton {
	return { text };
}

/** Request contact button */
export function contactButton(text: string): Extract<KeyboardButton, { request_contact: true }> {
	return { text, request_contact: true };
}

/** Request location button */
export function locationButton(text: string): Extract<KeyboardButton, { request_location: true }> {
	return { text, request_location: true };
}
