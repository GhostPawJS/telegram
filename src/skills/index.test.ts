import { strictEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
	defineTelegramSkill,
	getTelegramSkillByName,
	listTelegramSkills,
	telegramSkills,
} from './index.ts';

describe('skills barrel', () => {
	it('exports all expected symbols', () => {
		strictEqual(typeof defineTelegramSkill, 'function');
		strictEqual(typeof listTelegramSkills, 'function');
		strictEqual(typeof getTelegramSkillByName, 'function');
		strictEqual(Array.isArray(telegramSkills), true);
	});
});
