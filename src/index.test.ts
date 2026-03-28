import { strictEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
	createBot,
	DEFAULTS,
	errors,
	initTelegramTables,
	network,
	read,
	render,
	skills,
	soul,
	tools,
	types,
	write,
} from './index.ts';

describe('package root exports', () => {
	it('exposes the main namespaces', () => {
		strictEqual(typeof initTelegramTables, 'function');
		strictEqual(typeof createBot, 'function');
		strictEqual(typeof DEFAULTS, 'object');
		strictEqual(typeof read, 'object');
		strictEqual(typeof write, 'object');
		strictEqual(typeof network, 'object');
		strictEqual(typeof render, 'object');
		strictEqual(typeof tools, 'object');
		strictEqual(typeof skills, 'object');
		strictEqual(typeof soul, 'object');
		strictEqual(typeof types, 'object');
		strictEqual(typeof errors, 'object');
	});

	it('soul namespace has the Herald soul', () => {
		strictEqual(typeof soul.telegramSoul, 'object');
		strictEqual(soul.telegramSoul.slug, 'herald');
		strictEqual(typeof soul.renderTelegramSoulPromptFoundation, 'function');
	});

	it('tools namespace has registry functions', () => {
		strictEqual(typeof tools.getTelegramToolByName, 'function');
		strictEqual(typeof tools.listTelegramToolDefinitions, 'function');
		strictEqual(Array.isArray(tools.telegramTools), true);
	});

	it('skills namespace has registry functions', () => {
		strictEqual(typeof skills.listTelegramSkills, 'function');
		strictEqual(typeof skills.getTelegramSkillByName, 'function');
		strictEqual(Array.isArray(skills.telegramSkills), true);
	});

	it('errors namespace exposes isTelegramError', () => {
		strictEqual(typeof errors.isTelegramError, 'function');
	});

	it('does not leak namespaced members to the top level', () => {
		const pkg = {
			initTelegramTables,
			createBot,
			DEFAULTS,
			read,
			write,
			network,
			render,
			tools,
			skills,
			soul,
			types,
			errors,
		} as Record<string, unknown>;
		strictEqual('telegramSoul' in pkg, false);
		strictEqual('telegramTools' in pkg, false);
		strictEqual('listTelegramSkills' in pkg, false);
	});
});
