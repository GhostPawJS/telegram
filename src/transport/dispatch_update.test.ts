import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { Update } from 'grammy/types';
import type { UpdateHandlerMap } from './dispatch_update.ts';
import { dispatchUpdate } from './dispatch_update.ts';

function makeUpdate(fields: Record<string, unknown>): Update {
	return { update_id: 1, ...fields } as unknown as Update;
}

describe('dispatchUpdate', () => {
	it('dispatches to onMessage for message updates', async () => {
		const calls: string[] = [];
		const handlers: UpdateHandlerMap = {
			onMessage: () => {
				calls.push('message');
			},
		};
		await dispatchUpdate(makeUpdate({ message: { text: 'hi' } }), handlers);
		assert.deepEqual(calls, ['message']);
	});

	it('dispatches to onEditedMessage for edited_message updates', async () => {
		const calls: string[] = [];
		const handlers: UpdateHandlerMap = {
			onEditedMessage: () => {
				calls.push('edited_message');
			},
		};
		await dispatchUpdate(makeUpdate({ edited_message: { text: 'edited' } }), handlers);
		assert.deepEqual(calls, ['edited_message']);
	});

	it('dispatches to onCallbackQuery for callback_query updates', async () => {
		const calls: string[] = [];
		const handlers: UpdateHandlerMap = {
			onCallbackQuery: () => {
				calls.push('callback_query');
			},
		};
		await dispatchUpdate(makeUpdate({ callback_query: { id: '1' } }), handlers);
		assert.deepEqual(calls, ['callback_query']);
	});

	it('dispatches to onMyChatMember for my_chat_member updates', async () => {
		const calls: string[] = [];
		const handlers: UpdateHandlerMap = {
			onMyChatMember: () => {
				calls.push('my_chat_member');
			},
		};
		await dispatchUpdate(makeUpdate({ my_chat_member: { chat: {} } }), handlers);
		assert.deepEqual(calls, ['my_chat_member']);
	});

	it('dispatches to onChatMember for chat_member updates', async () => {
		const calls: string[] = [];
		const handlers: UpdateHandlerMap = {
			onChatMember: () => {
				calls.push('chat_member');
			},
		};
		await dispatchUpdate(makeUpdate({ chat_member: { chat: {} } }), handlers);
		assert.deepEqual(calls, ['chat_member']);
	});

	it('dispatches to onPollAnswer for poll_answer updates', async () => {
		const calls: string[] = [];
		const handlers: UpdateHandlerMap = {
			onPollAnswer: () => {
				calls.push('poll_answer');
			},
		};
		await dispatchUpdate(makeUpdate({ poll_answer: { poll_id: '1' } }), handlers);
		assert.deepEqual(calls, ['poll_answer']);
	});

	it('dispatches to onChatJoinRequest for chat_join_request updates', async () => {
		const calls: string[] = [];
		const handlers: UpdateHandlerMap = {
			onChatJoinRequest: () => {
				calls.push('chat_join_request');
			},
		};
		await dispatchUpdate(makeUpdate({ chat_join_request: { chat: {} } }), handlers);
		assert.deepEqual(calls, ['chat_join_request']);
	});

	it('dispatches to onMessageReaction for message_reaction updates', async () => {
		const calls: string[] = [];
		const handlers: UpdateHandlerMap = {
			onMessageReaction: () => {
				calls.push('message_reaction');
			},
		};
		await dispatchUpdate(makeUpdate({ message_reaction: { chat: {} } }), handlers);
		assert.deepEqual(calls, ['message_reaction']);
	});

	it('falls back to onUnknown when no specific handler matches', async () => {
		const calls: string[] = [];
		const handlers: UpdateHandlerMap = {
			onUnknown: () => {
				calls.push('unknown');
			},
		};
		await dispatchUpdate(makeUpdate({ some_future_field: {} }), handlers);
		assert.deepEqual(calls, ['unknown']);
	});

	it('does NOT call onUnknown when specific handler present', async () => {
		const calls: string[] = [];
		const handlers: UpdateHandlerMap = {
			onMessage: () => {
				calls.push('message');
			},
			onUnknown: () => {
				calls.push('unknown');
			},
		};
		await dispatchUpdate(makeUpdate({ message: { text: 'hi' } }), handlers);
		assert.deepEqual(calls, ['message']);
	});

	it('awaits async handlers', async () => {
		const order: number[] = [];
		const handlers: UpdateHandlerMap = {
			onMessage: async () => {
				await new Promise<void>((r) => setTimeout(r, 1));
				order.push(1);
			},
		};
		await dispatchUpdate(makeUpdate({ message: { text: 'hi' } }), handlers);
		order.push(2);
		assert.deepEqual(order, [1, 2]);
	});
});
