import { deepStrictEqual, ok, strictEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';
import * as pkg from '../index.ts';
import * as network from '../network.ts';
import * as read from '../read.ts';
import * as render from '../render.ts';
import * as write from '../write.ts';

describe('architecture invariants', () => {
	describe('read surface', () => {
		it('exports all entity query functions', () => {
			const expected = [
				'getUser',
				'listUsers',
				'userChats',
				'userMessages',
				'getChat',
				'listChats',
				'getMember',
				'listMembers',
				'getMessage',
				'listMessages',
				'replyChain',
				'album',
				'threadSummary',
				'searchMessages',
				'editHistory',
				'getFile',
				'listFiles',
				'getReactions',
				'getReactionCounts',
				'userReactions',
				'getCallbacks',
				'getStats',
				'getState',
			];
			for (const name of expected) {
				strictEqual(
					typeof (read as Record<string, unknown>)[name],
					'function',
					`read.${name} missing`,
				);
			}
		});
	});

	describe('write surface', () => {
		it('exports all executor functions', () => {
			const expected = [
				'sendMessage',
				'editMessage',
				'deleteMessage',
				'forwardMessage',
				'answerCallback',
				'setReaction',
				'sendChatAction',
				'pinMessage',
				'unpinMessage',
				'broadcast',
				'createStream',
			];
			for (const name of expected) {
				strictEqual(
					typeof (write as Record<string, unknown>)[name],
					'function',
					`write.${name} missing`,
				);
			}
		});
	});

	describe('network surface', () => {
		it('exports transport functions', () => {
			const expected = [
				'startPolling',
				'dispatchUpdate',
				'createConnectionState',
				'transitionState',
			];
			for (const name of expected) {
				strictEqual(
					typeof (network as Record<string, unknown>)[name],
					'function',
					`network.${name} missing`,
				);
			}
		});
	});

	describe('render surface', () => {
		it('exports all render functions', () => {
			const expected = [
				'escapeHtml',
				'escapeMarkdownV2',
				'markdownToHtml',
				'markdownToMarkdownV2',
				'splitText',
				'splitCaption',
			];
			for (const name of expected) {
				strictEqual(
					typeof (render as Record<string, unknown>)[name],
					'function',
					`render.${name} missing`,
				);
			}
		});
	});

	describe('package root', () => {
		it('exports all top-level namespaces', () => {
			strictEqual(typeof pkg.createBot, 'function');
			strictEqual(typeof pkg.initTelegramTables, 'function');
			strictEqual(typeof pkg.DEFAULTS, 'object');
			strictEqual(typeof pkg.read, 'object');
			strictEqual(typeof pkg.write, 'object');
			strictEqual(typeof pkg.network, 'object');
			strictEqual(typeof pkg.render, 'object');
			strictEqual(typeof pkg.tools, 'object');
			strictEqual(typeof pkg.skills, 'object');
			strictEqual(typeof pkg.soul, 'object');
			strictEqual(typeof pkg.errors, 'object');
		});

		it('tools registry has 4 tools', () => {
			strictEqual(pkg.tools.telegramTools.length, 4);
			const names = pkg.tools.telegramTools.map((t: { name: string }) => t.name).sort();
			deepStrictEqual(names, ['tg_connect', 'tg_manage', 'tg_read', 'tg_send']);
		});

		it('skills registry has 6 skills', () => {
			ok(Array.isArray(pkg.skills.telegramSkills));
			strictEqual(pkg.skills.telegramSkills.length, 6);
			const names = pkg.skills.telegramSkills.map((s: { name: string }) => s.name).sort();
			deepStrictEqual(names, [
				'broadcast-to-audience',
				'handle-group-administration',
				'manage-telegram-conversations',
				'moderate-chat-effectively',
				'search-and-retrieve-messages',
				'stream-progressive-responses',
			]);
		});

		it('all tool names are unique', () => {
			const names = pkg.tools.telegramTools.map((t: { name: string }) => t.name);
			strictEqual(new Set(names).size, names.length);
		});

		it('all skill names are unique', () => {
			const names = pkg.skills.telegramSkills.map((s: { name: string }) => s.name);
			strictEqual(new Set(names).size, names.length);
		});

		it('getTelegramToolByName returns correct tool', () => {
			const tool = pkg.tools.getTelegramToolByName('tg_read');
			ok(tool !== null);
			strictEqual(tool?.name, 'tg_read');
		});

		it('getTelegramToolByName returns null for unknown name', () => {
			const tool = pkg.tools.getTelegramToolByName('nonexistent');
			strictEqual(tool, null);
		});

		it('getTelegramSkillByName returns null for unknown name', () => {
			const skill = pkg.skills.getTelegramSkillByName('nonexistent');
			strictEqual(skill, null);
		});
	});
});
