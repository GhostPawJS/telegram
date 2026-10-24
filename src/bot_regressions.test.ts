import assert from 'node:assert/strict';
import { it } from 'node:test';
import { type BotConfig, createBot } from './bot.ts';
import { Bot } from './bot_api/bot.ts';
import { getStats } from './bot_state/get_stats.ts';
import { sendMessage } from './executor/send_message.ts';
import { sendPhoto } from './executor/send_photo.ts';
import { createInitializedTelegramDb } from './lib/test-db.ts';
import { getMessage } from './messages/get_message.ts';
import { searchMessages } from './messages/search_messages.ts';
import type { Update } from './telegram_types.ts';

const message = (id: number, text = 'oldword') => ({
	message_id: 1,
	date: 1,
	chat: { id, type: 'private' as const },
	text,
});

async function fixture(options: Partial<BotConfig> = {}) {
	const db = await createInitializedTelegramDb();
	let transport: Bot | undefined;
	const original = Bot.prototype.on;
	Bot.prototype.on = function (...args) {
		transport = this;
		return original.apply(this, args);
	};
	let bot: ReturnType<typeof createBot>;
	try {
		bot = createBot({
			token: 'test',
			db,
			api: {
				fetch: async () =>
					Response.json({ ok: true, result: { id: 99, is_bot: true, first_name: 'Test' } }),
			},
			...options,
		});
	} finally {
		Bot.prototype.on = original;
	}
	return {
		db,
		bot,
		post: async (update: unknown) => {
			await transport?.handleUpdate(update as Update);
			return { status: 200 };
		},
	};
}

it('outgoing text and media sends are mirrored and counted once', async () => {
	const { db, bot } = await fixture({
		api: {
			fetch: async (url) =>
				Response.json({
					ok: true,
					result: { ...message(123), message_id: String(url).endsWith('sendPhoto') ? 2 : 1 },
				}),
		},
	});
	try {
		await sendMessage(bot.client, 123, 'hello');
		await sendPhoto(bot.client, 123, 'file-id');
		assert.equal(getStats(db).messagesOut, 2);
		assert.equal(getMessage(db, 123, 1)?.direction, 'out');
	} finally {
		bot.stop();
		db.close();
	}
});

it('allowedChatIds ignores blocked messages and edits before storage and dispatch', async () => {
	let dispatched = 0;
	const { db, bot, post } = await fixture({
		allowedChatIds: [123],
		onMessage: () => {
			dispatched++;
		},
		onEditedMessage: () => {
			dispatched++;
		},
	});
	try {
		for (const id of [456, 123]) {
			assert.equal((await post({ update_id: id, message: message(id) })).status, 200);
			assert.equal(
				(await post({ update_id: id + 1, edited_message: message(id, 'newword') })).status,
				200,
			);
		}
		assert.equal(getMessage(db, 456, 1), null);
		assert.equal(dispatched, 2);
		assert.equal(getStats(db).messagesIn, 1);
		assert.equal(searchMessages(db, 123, 'newword').length, 1);
		assert.equal(searchMessages(db, 123, 'oldword').length, 0);
	} finally {
		bot.stop();
		db.close();
	}
});

it('empty allowedChatIds allows incoming chats and replies count as outgoing', async () => {
	let replies = 0;
	const { db, bot, post } = await fixture({
		api: {
			fetch: async (url) =>
				Response.json({
					ok: true,
					result: String(url).endsWith('getMe')
						? { id: 99, is_bot: true, first_name: 'Test' }
						: { ...message(456), message_id: 2 },
				}),
		},
		onMessage: async ({ reply }) => {
			await reply('hello');
			replies++;
		},
	});
	try {
		await post({ update_id: 1, message: message(456) });
		assert.equal(replies, 1);
		assert.equal(getStats(db).messagesIn, 1);
		assert.equal(getStats(db).messagesOut, 1);
		assert.equal(getMessage(db, 456, 2)?.direction, 'out');
	} finally {
		bot.stop();
		db.close();
	}
});
