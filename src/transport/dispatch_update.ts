import type { Update } from 'grammy/types';

export type UpdateHandler = (update: Update) => Promise<void> | void;

export interface UpdateHandlerMap {
	onMessage?: UpdateHandler;
	onEditedMessage?: UpdateHandler;
	onCallbackQuery?: UpdateHandler;
	onMyChatMember?: UpdateHandler;
	onChatMember?: UpdateHandler;
	onPollAnswer?: UpdateHandler;
	onChatJoinRequest?: UpdateHandler;
	onMessageReaction?: UpdateHandler;
	onUnknown?: UpdateHandler;
}

export async function dispatchUpdate(update: Update, handlers: UpdateHandlerMap): Promise<void> {
	if ('message' in update && update.message && handlers.onMessage) {
		await handlers.onMessage(update);
	} else if ('edited_message' in update && update.edited_message && handlers.onEditedMessage) {
		await handlers.onEditedMessage(update);
	} else if ('callback_query' in update && update.callback_query && handlers.onCallbackQuery) {
		await handlers.onCallbackQuery(update);
	} else if ('my_chat_member' in update && update.my_chat_member && handlers.onMyChatMember) {
		await handlers.onMyChatMember(update);
	} else if ('chat_member' in update && update.chat_member && handlers.onChatMember) {
		await handlers.onChatMember(update);
	} else if ('poll_answer' in update && update.poll_answer && handlers.onPollAnswer) {
		await handlers.onPollAnswer(update);
	} else if (
		'chat_join_request' in update &&
		update.chat_join_request &&
		handlers.onChatJoinRequest
	) {
		await handlers.onChatJoinRequest(update);
	} else if (
		'message_reaction' in update &&
		update.message_reaction &&
		handlers.onMessageReaction
	) {
		await handlers.onMessageReaction(update);
	} else if (handlers.onUnknown) {
		await handlers.onUnknown(update);
	}
}
