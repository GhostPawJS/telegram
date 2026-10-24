import assert from 'node:assert/strict';
import { it } from 'node:test';
import { initTelegramTables } from '../init_telegram_tables.ts';
import { createMockGrammy } from '../lib/mock_grammy.ts';
import { openTestDatabase } from '../lib/open-test-database.ts';
import { upsertMember } from '../members/index.ts';
import { createTelegramToolFacade } from './execution.ts';
import { tgSendTool } from './tg_send_tool.ts';

it('preserves plans by default and executes only with explicit opt-in', async () => {
	const db = await openTestDatabase();
	initTelegramTables(db);
	const mock = createMockGrammy();
	const input = { subcommand: 'send_message' as const, chatId: 1, text: 'hello' };
	assert.deepEqual(
		await createTelegramToolFacade({ client: mock.bot }).handler(db, 'tg_send', input),
		tgSendTool.handler(db, input),
	);
	assert.equal(mock.calls.length, 0);
	mock.setResponse('sendMessage', { message_id: 42, chat: { id: 1 }, date: 123 });
	const facade = createTelegramToolFacade({ client: mock.bot, execute: true });
	const result = await facade.handler(db, 'tg_send', input);
	assert.equal(result.ok, true);
	assert.deepEqual(result.ok && result.data, {
		action: 'send_message',
		chatId: 1,
		text: 'hello',
		parseMode: undefined,
		replyToMessageId: undefined,
		sent: { messageId: 42, chatId: 1, date: 123 },
	});
	assert.equal(mock.calls[0]?.method, 'sendMessage');
	assert.equal((await facade.handler(db, 'missing', {})).ok, false);
	assert.equal((await facade.handler(db, 'tg_send', { ...input, text: '' })).ok, false);
	assert.equal(
		(await facade.handler(db, 'tg_manage', { subcommand: 'list_members', chatId: 1 })).outcome,
		'no_op',
	);
	upsertMember(db, {
		chatId: 1,
		userId: 2,
		username: null,
		displayName: 'Member',
		status: 'member',
		permissions: null,
		customTitle: null,
		updatedAt: 0,
	});
	assert.equal(
		(await facade.handler(db, 'tg_manage', { subcommand: 'get_member', chatId: 1, userId: 2 })).ok,
		true,
	);
});

it('limits concurrent calls per chat and globally and honors bounded retry_after', async () => {
	const db = await openTestDatabase();
	initTelegramTables(db);
	let time = 0;
	const waits: number[] = [];
	const calls: number[] = [];
	const mock = createMockGrammy();
	let failures = 1;
	mock.bot.call = async () => {
		calls.push(time);
		if (failures-- > 0) throw { error_code: 429, parameters: { retry_after: 2 } };
		return true;
	};
	const facade = createTelegramToolFacade({
		client: mock.bot,
		execute: true,
		now: () => time,
		sleep: async (ms) => {
			waits.push(ms);
			time += ms;
		},
	});
	const input = { subcommand: 'send_typing', chatId: 1 };
	assert.equal((await facade.handler(db, 'tg_send', input)).ok, true);
	await facade.handler(db, 'tg_send', input);
	await facade.handler(db, 'tg_send', { ...input, chatId: 2 });
	assert.deepEqual(calls.slice(0, 3), [0, 2000, 3000]);
	assert.ok(waits.some((ms) => ms > 30 && ms < 34));
	failures = 10;
	const result = await facade.handler(db, 'tg_send', input);
	assert.equal(result.ok, false);
	assert.equal(calls.length, 7);
	for (const options of [
		{ perChatPerSecond: 0 },
		{ globalPerSecond: Infinity },
		{ maxRetries: -1 },
	])
		assert.throws(() => createTelegramToolFacade({ client: mock.bot, ...options }));
});

it('masks tokens in facade errors, including thrown strings and malformed retry errors', async () => {
	const db = await openTestDatabase();
	initTelegramTables(db);
	const mock = createMockGrammy();
	const token = `123456:${'x'.repeat(35)}`;
	for (const error of [
		new Error(token),
		token,
		null,
		{ error_code: 429, parameters: { retry_after: -1 } },
	]) {
		mock.bot.call = async () => {
			throw error;
		};
		const result = await createTelegramToolFacade({ client: mock.bot, execute: true }).handler(
			db,
			'tg_send',
			{ subcommand: 'send_typing', chatId: 1 },
		);
		assert.equal(result.ok, false);
		assert.ok(!JSON.stringify(result).includes(token));
	}
});

it('executes message and moderation actions using Telegram parameters', async () => {
	const db = await openTestDatabase();
	initTelegramTables(db);
	const { insertMessage } = await import('../messages/index.ts');
	const { normalizeMessage } = await import('../normalize/normalize_message.ts');
	insertMessage(
		db,
		normalizeMessage(
			{
				message_id: 1,
				date: 1,
				chat: { id: 1, type: 'private', first_name: 'Chat' },
				text: 'hello',
			},
			'in',
			99,
		),
	);
	upsertMember(db, {
		chatId: 1,
		userId: 2,
		username: null,
		displayName: 'Member',
		status: 'member',
		permissions: null,
		customTitle: null,
		updatedAt: 0,
	});
	const mock = createMockGrammy();
	for (const method of ['editMessageText', 'forwardMessage'])
		mock.setResponse(method, { message_id: 1, chat: { id: 1 }, date: 1 });
	let time = 0;
	const facade = createTelegramToolFacade({
		client: mock.bot,
		execute: true,
		now: () => time,
		sleep: async (ms) => {
			time += ms;
		},
	});
	const actions = [
		['edit_message', 'editMessageText'],
		['delete_message', 'deleteMessage'],
		['pin_message', 'pinChatMessage'],
		['unpin_message', 'unpinChatMessage'],
		['forward_message', 'forwardMessage'],
		['ban_user', 'banChatMember'],
		['unban_user', 'unbanChatMember'],
		['restrict_user', 'restrictChatMember'],
		['promote_user', 'promoteChatMember'],
		['kick_user', 'unbanChatMember'],
	];
	for (const [subcommand, method] of actions) {
		const result = await facade.handler(
			db,
			subcommand?.endsWith('user') ? 'tg_manage' : 'tg_send',
			{
				subcommand,
				chatId: 1,
				userId: 2,
				messageId: 1,
				text: 'updated',
				toChatId: 1,
				fromChatId: 2,
				isAdmin: false,
				canSendMessages: false,
				untilDate: 10,
				deleteMessages: true,
			},
		);
		assert.equal(result.ok, true, subcommand);
		assert.equal(mock.calls.at(-1)?.method, method);
	}
	assert.deepEqual(mock.calls.find((call) => call.method === 'restrictChatMember')?.args, [
		{ chat_id: 1, user_id: 2, permissions: { can_send_messages: false }, until_date: 10 },
	]);
	assert.equal(mock.calls.filter((call) => call.method === 'banChatMember').length, 2);
});

it('reserves rate-limit slots for concurrent callers', async () => {
	const db = await openTestDatabase();
	initTelegramTables(db);
	const mock = createMockGrammy();
	const waits: number[] = [];
	const facade = createTelegramToolFacade({
		client: mock.bot,
		execute: true,
		now: () => 0,
		sleep: async (ms) => {
			waits.push(ms);
		},
	});
	await Promise.all(
		[1, 1, 2].map((chatId) => facade.handler(db, 'tg_send', { subcommand: 'send_typing', chatId })),
	);
	assert.equal(mock.calls.length, 3);
	assert.equal(waits[0], 1000);
	assert.ok((waits[1] ?? 0) > 1033 && (waits[1] ?? 0) < 1034);
});
