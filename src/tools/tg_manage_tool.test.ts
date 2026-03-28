import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';

import type { TelegramDb } from '../database.ts';
import { initTelegramTables } from '../init_telegram_tables.ts';
import { openTestDatabase } from '../lib/open-test-database.ts';
import type { Member } from '../members/index.ts';
import { upsertMember } from '../members/index.ts';
import { tgManageTool } from './tg_manage_tool.ts';

const CHAT_ID = 100;
const USER_ID = 42;

const sampleMember: Member = {
	chatId: CHAT_ID,
	userId: USER_ID,
	username: 'alice',
	displayName: 'Alice',
	status: 'member',
	permissions: null,
	customTitle: null,
	updatedAt: 0,
};

describe('tgManageTool', () => {
	describe('get_member', () => {
		let db: TelegramDb;

		before(async () => {
			db = await openTestDatabase();
			initTelegramTables(db);
		});

		it('returns toolFailure when member not found', () => {
			const result = tgManageTool.handler(db, {
				subcommand: 'get_member',
				chatId: CHAT_ID,
				userId: 999,
			});
			assert.equal(result.ok, false);
			assert.equal('error' in result && result.error.code, 'not_found');
		});
	});

	describe('list_members', () => {
		let db: TelegramDb;

		before(async () => {
			db = await openTestDatabase();
			initTelegramTables(db);
		});

		it('returns toolNoOp when no members in chat', () => {
			const result = tgManageTool.handler(db, { subcommand: 'list_members', chatId: 9999 });
			assert.equal(result.ok, true);
			assert.equal('outcome' in result && result.outcome, 'no_op');
		});
	});

	describe('ban_user', () => {
		let db: TelegramDb;

		before(async () => {
			db = await openTestDatabase();
			initTelegramTables(db);
			upsertMember(db, sampleMember);
		});

		it('returns toolSuccess with action data when member exists', () => {
			const result = tgManageTool.handler(db, {
				subcommand: 'ban_user',
				chatId: CHAT_ID,
				userId: USER_ID,
			});
			assert.equal(result.ok, true);
			if (result.ok) {
				const data = result.data as { action: string; chatId: number; userId: number };
				assert.equal(data.action, 'ban_user');
				assert.equal(data.chatId, CHAT_ID);
				assert.equal(data.userId, USER_ID);
			}
		});

		it('returns toolFailure not_found when member does not exist', () => {
			const result = tgManageTool.handler(db, {
				subcommand: 'ban_user',
				chatId: CHAT_ID,
				userId: 8888,
			});
			assert.equal(result.ok, false);
			assert.equal('error' in result && result.error.code, 'not_found');
		});
	});

	describe('unban_user', () => {
		let db: TelegramDb;

		before(async () => {
			db = await openTestDatabase();
			initTelegramTables(db);
		});

		it('returns toolSuccess without checking member existence', () => {
			const result = tgManageTool.handler(db, {
				subcommand: 'unban_user',
				chatId: CHAT_ID,
				userId: 7777,
			});
			assert.equal(result.ok, true);
			if (result.ok) {
				const data = result.data as { action: string; userId: number };
				assert.equal(data.action, 'unban_user');
				assert.equal(data.userId, 7777);
			}
		});
	});

	describe('list_members with members', () => {
		let db: TelegramDb;

		before(async () => {
			db = await openTestDatabase();
			initTelegramTables(db);
			upsertMember(db, sampleMember);
			upsertMember(db, { ...sampleMember, userId: 43, displayName: 'Bob', username: 'bob' });
		});

		it('returns toolSuccess with array of members', () => {
			const result = tgManageTool.handler(db, { subcommand: 'list_members', chatId: CHAT_ID });
			assert.equal(result.ok, true);
			assert.equal('outcome' in result && result.outcome, 'success');
			if (result.ok) {
				assert.equal(Array.isArray(result.data), true);
				assert.equal((result.data as unknown[]).length, 2);
			}
		});
	});
});

describe('tgManageTool - restrict_user', () => {
	let db: TelegramDb;
	before(async () => {
		db = await openTestDatabase();
		initTelegramTables(db);
	});

	it('returns toolFailure when member not found', () => {
		const result = tgManageTool.handler(db, {
			subcommand: 'restrict_user',
			chatId: CHAT_ID,
			userId: 999,
			canSendMessages: false,
		});
		assert.equal(result.ok, false);
	});

	it('returns toolSuccess with action data when member exists', () => {
		upsertMember(db, sampleMember);
		const result = tgManageTool.handler(db, {
			subcommand: 'restrict_user',
			chatId: CHAT_ID,
			userId: USER_ID,
			canSendMessages: false,
		});
		assert.equal(result.ok, true);
		if (result.ok) {
			const data = result.data as { action: string };
			assert.equal(data.action, 'restrict_user');
		}
	});
});

describe('tgManageTool - promote_user', () => {
	let db: TelegramDb;
	before(async () => {
		db = await openTestDatabase();
		initTelegramTables(db);
	});

	it('returns toolFailure when member not found', () => {
		const result = tgManageTool.handler(db, {
			subcommand: 'promote_user',
			chatId: CHAT_ID,
			userId: 999,
			isAdmin: true,
		});
		assert.equal(result.ok, false);
	});

	it('returns toolSuccess when member exists', () => {
		upsertMember(db, sampleMember);
		const result = tgManageTool.handler(db, {
			subcommand: 'promote_user',
			chatId: CHAT_ID,
			userId: USER_ID,
			isAdmin: true,
		});
		assert.equal(result.ok, true);
		if (result.ok) {
			const data = result.data as { action: string; isAdmin: boolean };
			assert.equal(data.action, 'promote_user');
			assert.equal(data.isAdmin, true);
		}
	});
});

describe('tgManageTool - kick_user', () => {
	let db: TelegramDb;
	before(async () => {
		db = await openTestDatabase();
		initTelegramTables(db);
	});

	it('returns toolFailure when member not found', () => {
		const result = tgManageTool.handler(db, {
			subcommand: 'kick_user',
			chatId: CHAT_ID,
			userId: 999,
		});
		assert.equal(result.ok, false);
	});

	it('returns toolSuccess when member exists', () => {
		upsertMember(db, sampleMember);
		const result = tgManageTool.handler(db, {
			subcommand: 'kick_user',
			chatId: CHAT_ID,
			userId: USER_ID,
		});
		assert.equal(result.ok, true);
		if (result.ok) {
			const data = result.data as { action: string };
			assert.equal(data.action, 'kick_user');
		}
	});
});
