import assert from 'node:assert/strict';
import { it } from 'node:test';
import type { Update } from 'grammy/types';
import { createBot } from './bot.ts';
import { Bot } from './bot_api/bot.ts';
import { initTelegramTables } from './init_telegram_tables.ts';
import { openTestDatabase } from './lib/open-test-database.ts';
import { getMessage } from './messages/index.ts';

it('routes intake, edits, callbacks, membership and reactions without network access', async () => {
	const db = await openTestDatabase();
	initTelegramTables(db);
	let captured: Bot | undefined;
	const original = Bot.prototype.on;
	Bot.prototype.on = function (...args: Parameters<typeof original>) {
		captured = this;
		return original.apply(this, args);
	};
	const events: string[] = [];
	try {
		const bot = createBot({
			token: '123:local',
			db,
			onMessage: async (ctx) => {
				events.push('message');
				await ctx.reply('reply');
			},
			onEditedMessage: async (ctx) => {
				events.push('edit');
				await ctx.reply('edited');
			},
			onCallback: async (ctx) => {
				events.push('callback');
				await ctx.answer('ok');
				await ctx.answer();
			},
			onMemberUpdate: async () => {
				events.push('member');
			},
			onReaction: async () => {
				events.push('reaction');
			},
		});
		assert.ok(bot.client);
		assert.ok(captured);
		captured.botInfo = {
			id: 99,
			is_bot: true,
			first_name: 'Bot',
			username: 'local',
			can_join_groups: true,
			can_read_all_group_messages: false,
			supports_inline_queries: false,
			can_connect_to_business: false,
			has_main_web_app: false,
			has_topics_enabled: false,
			allows_users_to_create_topics: false,
		};
		captured.api.config.use(async () => ({ ok: true, result: true }) as never);
		const user = { id: 2, is_bot: false, first_name: 'Test', last_name: 'User' };
		const chat = { id: 1, type: 'private', first_name: 'Test' };
		let id = 0;
		const update = async (data: object) =>
			captured?.handleUpdate({ update_id: ++id, ...data } as Update);
		const message = { message_id: 1, date: 123, chat, from: user, text: 'hello' };
		await update({ message });
		assert.equal(getMessage(db, 1, 1)?.text, 'hello');
		await update({ edited_message: { ...message, text: 'changed', edit_date: 124 } });
		assert.equal(getMessage(db, 1, 1)?.text, 'changed');
		await update({ edited_message: { ...message, message_id: 999 } });
		await update({
			callback_query: { id: 'callback', from: user, chat_instance: '1', message, data: 'test' },
		});
		await update({
			my_chat_member: {
				chat,
				from: user,
				date: 123,
				old_chat_member: { status: 'left', user },
				new_chat_member: { status: 'member', user },
			},
		});
		const reactions = [
			{ type: 'emoji', emoji: '👍' },
			{ type: 'custom_emoji', custom_emoji_id: '42' },
			{ type: 'paid' },
		];
		await update({
			message_reaction: {
				chat,
				message_id: 1,
				date: 125,
				user,
				old_reaction: [],
				new_reaction: reactions,
			},
		});
		await update({
			message_reaction_count: {
				chat,
				message_id: 1,
				date: 125,
				reactions: reactions.map((type) => ({ type, total_count: 2 })),
			},
		});
		assert.deepEqual(events, ['message', 'edit', 'callback', 'member', 'reaction']);
		await update({ message: { ...message, message_id: 2, from: undefined } });
		await update({
			edited_message: { ...message, message_id: 2, from: undefined, text: undefined },
		});
		await update({ callback_query: { id: 'inline', from: user, chat_instance: '1' } });
		await update({
			message_reaction: {
				chat,
				message_id: 1,
				date: 125,
				old_reaction: [{ type: 'emoji' }, { type: 'custom_emoji' }],
				new_reaction: [],
			},
		});
		await update({
			message_reaction: { chat, message_id: 1, date: 125, user: { ...user, last_name: undefined } },
		});
		await update({ message_reaction_count: { chat, message_id: 1, date: 125 } });
		await update({
			message_reaction_count: {
				chat,
				message_id: 1,
				date: 125,
				reactions: [{ type: { type: 'emoji' }, total_count: 1 }],
			},
		});
		await update({
			message_reaction_count: {
				chat,
				message_id: 1,
				date: 125,
				reactions: [{ type: { type: 'custom_emoji' }, total_count: 1 }],
			},
		});
		assert.equal(events.filter((event) => event === 'reaction').length, 3);
	} finally {
		Bot.prototype.on = original;
	}
});
