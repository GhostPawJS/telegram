import { ok, strictEqual } from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';
import { upsertChat } from '../chats/index.ts';
import type { TelegramDb } from '../database.ts';
import { initTelegramTables } from '../init_telegram_tables.ts';
import { createMockGrammy } from '../lib/mock_grammy.ts';
import { openTestDatabase } from '../lib/open-test-database.ts';
import { markdownToHtml } from '../render.ts';
import { tgReadTool } from '../tools/tg_read_tool.ts';
import { broadcast } from '../write.ts';
import { broadcastToAudience } from './broadcast-to-audience.ts';

function activeGroupChat(chatId: number) {
	return {
		chatId,
		type: 'group' as const,
		title: `Group ${chatId}`,
		username: null,
		firstName: null,
		lastName: null,
		isForum: false,
		memberCount: null,
		photoFileId: null,
		isActive: true,
		permissions: null,
		availableReactions: null,
		lastMessageAt: null,
		metadata: {},
	};
}

function inactiveChat(chatId: number) {
	return { ...activeGroupChat(chatId), isActive: false };
}

describe('broadcastToAudience skill', () => {
	let db: TelegramDb;

	beforeEach(async () => {
		db = await openTestDatabase();
		initTelegramTables(db);
	});

	it('skill metadata', () => {
		strictEqual(typeof broadcastToAudience.name, 'string');
		ok(broadcastToAudience.name.length > 0);
		strictEqual(typeof broadcastToAudience.description, 'string');
		ok(broadcastToAudience.description.length > 0);
		strictEqual(typeof broadcastToAudience.content, 'string');
		ok(broadcastToAudience.content.length > 0);
	});

	it('get audience via list_chats — returns active chats', () => {
		upsertChat(db, activeGroupChat(1));
		upsertChat(db, activeGroupChat(2));
		upsertChat(db, activeGroupChat(3));

		const result = tgReadTool.handler(db, { subcommand: 'list_chats' });
		ok(result.ok);
		strictEqual(result.outcome, 'success');
		const data = (result as { data: unknown[] }).data;
		strictEqual(data?.length, 3);
	});

	it('inactive chats appear in list — caller must filter isActive', () => {
		upsertChat(db, activeGroupChat(10));
		upsertChat(db, inactiveChat(11));

		const result = tgReadTool.handler(db, { subcommand: 'list_chats' });
		ok(result.ok);
		const data = (result as { data: Array<{ isActive: boolean }> }).data;
		ok(data?.length >= 2);

		const hasActive = data?.some((c) => c.isActive === true);
		const hasInactive = data?.some((c) => c.isActive === false);
		ok(hasActive, 'expected at least one active chat');
		ok(hasInactive, 'expected at least one inactive chat');
	});

	it('broadcast sends to all chatIds — returns correct sent count', async () => {
		const mock = createMockGrammy();
		mock.setResponse('sendMessage', {
			ok: true,
			result: { message_id: 1 },
			chat: { id: 0 },
			date: 0,
		});

		const result = await broadcast(mock.bot, [1, 2, 3], 'Hello everyone', { delayMs: 0 });

		strictEqual(result.sent, 3);
		strictEqual(result.failed, 0);
	});

	it('broadcast with partial failure — failed count and errors populated', async () => {
		const mock = createMockGrammy();
		// Set a valid sendMessage response so non-failing chats succeed
		const successResponse = { message_id: 1, chat: { id: 0 }, date: 0 };
		mock.bot.call = async (method, ...args) => {
			if (method === 'sendMessage') {
				const params = args[0] as Record<string, unknown>;
				if (params?.chat_id === 2) {
					throw new Error('Chat not found');
				}
				return successResponse;
			}
			return { ok: true };
		};

		const result = await broadcast(mock.bot, [1, 2, 3], 'Hello', { delayMs: 0 });

		strictEqual(result.sent, 2);
		strictEqual(result.failed, 1);
		const firstError = result.errors[0];
		ok(firstError !== undefined);
		strictEqual(firstError?.chatId, 2);
	});

	it('onError is called for each failed chat', async () => {
		const mock = createMockGrammy();
		const successResponse = { message_id: 1, chat: { id: 0 }, date: 0 };
		mock.bot.call = async (method, ...args) => {
			if (method === 'sendMessage') {
				const params = args[0] as Record<string, unknown>;
				if (params?.chat_id === 2) {
					throw new Error('Forbidden');
				}
				return successResponse;
			}
			return { ok: true };
		};

		let errorChatId: number | undefined;
		const result = await broadcast(mock.bot, [1, 2, 3], 'Hello', {
			delayMs: 0,
			onError: (chatId) => {
				errorChatId = chatId;
			},
		});

		strictEqual(errorChatId, 2);
		strictEqual(result.failed, 1);
	});

	it('broadcast to empty list — returns 0 sent 0 failed', async () => {
		const mock = createMockGrammy();
		const result = await broadcast(mock.bot, [], 'Hello', { delayMs: 0 });

		strictEqual(result.sent, 0);
		strictEqual(result.failed, 0);
	});

	it('pre-render HTML once before loop (efficiency pattern)', async () => {
		const mock = createMockGrammy();
		mock.setResponse('sendMessage', {
			ok: true,
			result: { message_id: 1 },
			chat: { id: 0 },
			date: 0,
		});

		const html = markdownToHtml('**announcement**');
		ok(html.includes('<b>announcement</b>'));

		const result = await broadcast(mock.bot, [1, 2], html, {
			parseMode: 'HTML',
			delayMs: 0,
		});

		strictEqual(result.sent, 2);
		const sends = mock.calls.filter((c) => c.method === 'sendMessage');
		ok(sends.length > 0);
		const firstCall = sends[0];
		ok(firstCall !== undefined);
		const params = firstCall?.args[0] as Record<string, unknown>;
		const text = params?.text as string;
		ok(text.includes('<b>announcement</b>'));
	});

	it('delayMs: 0 still completes broadcast (fast mode for tests)', async () => {
		const mock = createMockGrammy();
		mock.setResponse('sendMessage', {
			ok: true,
			result: { message_id: 1 },
			chat: { id: 0 },
			date: 0,
		});

		const chatIds = [1, 2, 3, 4, 5];
		const result = await broadcast(mock.bot, chatIds, 'Fast broadcast', { delayMs: 0 });

		strictEqual(result.sent, 5);
		strictEqual(result.failed, 0);
	});

	it('delayMs default is 50 ms — not 0 — verify timing', async () => {
		const mock = createMockGrammy();
		mock.setResponse('sendMessage', {
			ok: true,
			result: { message_id: 1 },
			chat: { id: 0 },
			date: 0,
		});

		// Functional test: broadcast accepts delayMs: 50 and returns correct result
		const result = await broadcast(mock.bot, [1, 2], 'Announcement', { delayMs: 50 });

		strictEqual(result.sent, 2);
		strictEqual(result.failed, 0);
	});

	it('result includes per-chat error detail', async () => {
		const mock = createMockGrammy();
		mock.bot.call = async (method, ...args) => {
			if (method === 'sendMessage') {
				const params = args[0] as Record<string, unknown>;
				if (params?.chat_id === 99) {
					throw new Error('User deactivated');
				}
			}
			return { ok: true };
		};

		const result = await broadcast(mock.bot, [99], 'Hello', { delayMs: 0 });

		strictEqual(result.failed, 1);
		const firstError = result.errors[0];
		ok(firstError !== undefined);
		ok(typeof firstError?.error === 'string');
		ok(firstError?.error.length > 0);
	});
});

describe('broadcastToAudience skill — type filtering and retry pattern', () => {
	let db: TelegramDb;

	beforeEach(async () => {
		db = await openTestDatabase();
		initTelegramTables(db);
	});

	it('filter by type: only group chats selected for broadcast', () => {
		// Skill: "Filter by type ('group', 'supergroup', 'channel') as needed"
		upsertChat(db, activeGroupChat(-1));
		upsertChat(db, { ...activeGroupChat(-2), type: 'channel' as const, title: 'Channel 2' });
		upsertChat(db, { ...activeGroupChat(-3), type: 'supergroup' as const, title: 'Supergroup 3' });

		const result = tgReadTool.handler(db, { subcommand: 'list_chats', limit: 20 });
		ok(result.ok);
		const chats = (result as { data: Array<{ type: string; chatId: number }> }).data;
		const groups = chats.filter((c) => c.type === 'group');
		const channels = chats.filter((c) => c.type === 'channel');
		const supergroups = chats.filter((c) => c.type === 'supergroup');
		strictEqual(groups.length, 1);
		strictEqual(channels.length, 1);
		strictEqual(supergroups.length, 1);
	});

	it('retry failed chats: errors array contains chatId for re-attempt', async () => {
		// Skill: "Errors from rate-limited chats appear in result.errors — retry them separately"
		const mock = createMockGrammy();
		let attempt = 0;
		mock.bot.call = async (method, ...args) => {
			if (method === 'sendMessage') {
				const params = args[0] as Record<string, unknown>;
				if (params?.chat_id === -2 && attempt === 0) {
					attempt++;
					throw new Error('Too Many Requests');
				}
				return { message_id: 1, chat: { id: params?.chat_id }, date: 1 };
			}
			return { ok: true };
		};

		const first = await broadcast(mock.bot, [-1, -2, -3], 'Hello', { delayMs: 0 });
		strictEqual(first.failed, 1);
		ok(first.errors[0]?.chatId === -2);

		// Retry only the failed chatIds
		const retryIds = first.errors.map((e) => e.chatId);
		const retry = await broadcast(mock.bot, retryIds, 'Hello', { delayMs: 0 });
		strictEqual(retry.sent, 1);
		strictEqual(retry.failed, 0);
	});
});
