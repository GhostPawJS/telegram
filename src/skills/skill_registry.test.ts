import { notStrictEqual, strictEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { getTelegramSkillByName, listTelegramSkills } from './skill_registry.ts';

describe('skill registry', () => {
	it('lists all skills (6 total)', () => {
		const skills = listTelegramSkills();
		strictEqual(Array.isArray(skills), true);
		strictEqual(skills.length, 6);
	});

	it('returns the manage-telegram-conversations skill by name', () => {
		const skill = getTelegramSkillByName('manage-telegram-conversations');
		notStrictEqual(skill, null);
	});

	it('returns null for unknown skill name', () => {
		strictEqual(getTelegramSkillByName('nonexistent'), null);
	});
});
