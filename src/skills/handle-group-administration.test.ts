import { ok, strictEqual } from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';
import { upsertChat } from '../chats/index.ts';
import type { TelegramDb } from '../database.ts';
import { initTelegramTables } from '../init_telegram_tables.ts';
import { openTestDatabase } from '../lib/open-test-database.ts';
import { upsertMember } from '../members/index.ts';
import type { Member } from '../members/types.ts';
import { tgManageTool } from '../tools/tg_manage_tool.ts';
import { tgReadTool } from '../tools/tg_read_tool.ts';
import { handleGroupAdministration } from './handle-group-administration.ts';

const CHAT_ID = -100;

const member = (userId: number, status: 'member' | 'administrator' | 'restricted'): Member => ({
	chatId: CHAT_ID,
	userId,
	username: null,
	displayName: `User ${userId}`,
	status,
	permissions: null,
	customTitle: null,
	updatedAt: 1000,
});

function seedChat(db: TelegramDb): void {
	upsertChat(db, {
		chatId: CHAT_ID,
		type: 'supergroup',
		title: 'Test Group',
		username: null,
		firstName: null,
		lastName: null,
		isForum: false,
		memberCount: 10,
		photoFileId: null,
		isActive: true,
		permissions: null,
		availableReactions: null,
		lastMessageAt: null,
		metadata: {},
	});
}

describe('handleGroupAdministration skill', () => {
	let db: TelegramDb;

	beforeEach(async () => {
		db = await openTestDatabase();
		initTelegramTables(db);
	});

	it('skill metadata', () => {
		strictEqual(handleGroupAdministration.name, 'handle-group-administration');
		ok(handleGroupAdministration.description.length > 0);
		ok(handleGroupAdministration.content.length > 0);
	});

	it('reading member state before taking action (get_member)', () => {
		upsertMember(db, member(1, 'member'));
		const result = tgManageTool.handler(db, {
			subcommand: 'get_member',
			chatId: CHAT_ID,
			userId: 1,
		});
		ok(result.ok);
		const data = result.ok ? (result.data as Member) : null;
		strictEqual(data?.status, 'member');
	});

	it('get_member returns not_found for unknown user', () => {
		const result = tgManageTool.handler(db, {
			subcommand: 'get_member',
			chatId: CHAT_ID,
			userId: 999,
		});
		strictEqual(result.ok, false);
	});

	it('list_members returns all members in chat', () => {
		upsertMember(db, member(1, 'member'));
		upsertMember(db, member(2, 'member'));
		upsertMember(db, member(3, 'member'));
		const result = tgManageTool.handler(db, { subcommand: 'list_members', chatId: CHAT_ID });
		ok(result.ok);
		const data = result.ok ? (result.data as Member[]) : [];
		strictEqual(data.length, 3);
	});

	it('list_members with status filter — only restricted', () => {
		upsertMember(db, member(1, 'member'));
		upsertMember(db, member(2, 'restricted'));
		upsertMember(db, member(3, 'restricted'));
		const result = tgManageTool.handler(db, {
			subcommand: 'list_members',
			chatId: CHAT_ID,
			status: 'restricted',
		});
		ok(result.ok);
		const data = result.ok ? (result.data as Member[]) : [];
		strictEqual(data.length, 2);
	});

	it('get_chat returns chat metadata', () => {
		seedChat(db);
		const result = tgReadTool.handler(db, { subcommand: 'get_chat', chatId: CHAT_ID });
		ok(result.ok);
		const data = result.ok ? (result.data as Record<string, unknown>) : null;
		strictEqual(data?.title, 'Test Group');
	});

	it('ban_user workflow: check member first, then ban', () => {
		upsertMember(db, member(10, 'member'));
		const check = tgManageTool.handler(db, {
			subcommand: 'get_member',
			chatId: CHAT_ID,
			userId: 10,
		});
		ok(check.ok);
		const ban = tgManageTool.handler(db, { subcommand: 'ban_user', chatId: CHAT_ID, userId: 10 });
		ok(ban.ok);
		const data = ban.ok ? (ban.data as Record<string, unknown>) : null;
		strictEqual(data?.action, 'ban_user');
	});

	it('ban_user fails gracefully when user not in member table', () => {
		const result = tgManageTool.handler(db, {
			subcommand: 'ban_user',
			chatId: CHAT_ID,
			userId: 888,
		});
		strictEqual(result.ok, false);
		if (!result.ok && result.outcome === 'error') {
			strictEqual(result.error.code, 'not_found');
		}
	});

	it('unban_user is always safe — works even without prior member record', () => {
		const result = tgManageTool.handler(db, {
			subcommand: 'unban_user',
			chatId: CHAT_ID,
			userId: 777,
		});
		ok(result.ok);
	});

	it('restrict_user mutes member — returns action descriptor', () => {
		upsertMember(db, member(20, 'member'));
		const result = tgManageTool.handler(db, {
			subcommand: 'restrict_user',
			chatId: CHAT_ID,
			userId: 20,
			canSendMessages: false,
		});
		ok(result.ok);
		const data = result.ok ? (result.data as Record<string, unknown>) : null;
		strictEqual(data?.action, 'restrict_user');
		strictEqual(data?.userId, 20);
	});

	it('promote_user to admin — returns action descriptor', () => {
		upsertMember(db, member(30, 'member'));
		const result = tgManageTool.handler(db, {
			subcommand: 'promote_user',
			chatId: CHAT_ID,
			userId: 30,
			isAdmin: true,
		});
		ok(result.ok);
		const data = result.ok ? (result.data as Record<string, unknown>) : null;
		strictEqual(data?.action, 'promote_user');
		strictEqual(data?.isAdmin, true);
	});

	it('kick_user — returns action descriptor', () => {
		upsertMember(db, member(40, 'member'));
		const result = tgManageTool.handler(db, {
			subcommand: 'kick_user',
			chatId: CHAT_ID,
			userId: 40,
		});
		ok(result.ok);
		const data = result.ok ? (result.data as Record<string, unknown>) : null;
		strictEqual(data?.action, 'kick_user');
	});

	it('re-check after role change: get_member reflects updated status', () => {
		upsertMember(db, member(50, 'member'));
		upsertMember(db, member(50, 'administrator'));
		const result = tgManageTool.handler(db, {
			subcommand: 'get_member',
			chatId: CHAT_ID,
			userId: 50,
		});
		ok(result.ok);
		const data = result.ok ? (result.data as Member) : null;
		strictEqual(data?.status, 'administrator');
	});
});

describe('handleGroupAdministration skill — temporary ban and revoke admin', () => {
	let db: TelegramDb;

	beforeEach(async () => {
		db = await openTestDatabase();
		initTelegramTables(db);
	});

	it('ban_user with untilDate — action descriptor includes expiry', () => {
		// Skill: "optionally set untilDate for temporary bans"
		upsertMember(db, member(10, 'member'));
		const untilDate = Math.floor(Date.now() / 1000) + 86_400;
		const result = tgManageTool.handler(db, {
			subcommand: 'ban_user',
			chatId: CHAT_ID,
			userId: 10,
			untilDate,
		});
		ok(result.ok);
		const data = (result as { data: Record<string, unknown> }).data;
		strictEqual(data.untilDate, untilDate);
		strictEqual(data.action, 'ban_user');
	});

	it('promote_user with isAdmin: false — revokes admin rights', () => {
		// Skill: "promote_user — sets or removes admin rights; pass isAdmin: false to revoke"
		upsertMember(db, member(11, 'administrator'));
		const result = tgManageTool.handler(db, {
			subcommand: 'promote_user',
			chatId: CHAT_ID,
			userId: 11,
			isAdmin: false,
		});
		ok(result.ok);
		const data = (result as { data: Record<string, unknown> }).data;
		strictEqual(data.action, 'promote_user');
		strictEqual(data.isAdmin, false);
	});

	it('ban_user with deleteMessages flag — included in action descriptor', () => {
		// Skill: "ban_user — optionally set deleteMessages"
		upsertMember(db, member(12, 'member'));
		const result = tgManageTool.handler(db, {
			subcommand: 'ban_user',
			chatId: CHAT_ID,
			userId: 12,
			deleteMessages: true,
		});
		ok(result.ok);
		const data = (result as { data: Record<string, unknown> }).data;
		strictEqual(data.deleteMessages, true);
	});
});
