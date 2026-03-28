import { strictEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { defineTelegramSkill } from './skill_types.ts';

describe('defineTelegramSkill', () => {
	it('returns the skill unchanged (identity function for type inference)', () => {
		const skill = defineTelegramSkill({ name: 'test', description: 'a test', content: '# Test' });
		strictEqual(skill.name, 'test');
		strictEqual(skill.description, 'a test');
	});
});
