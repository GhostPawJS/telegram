import { strictEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { defineCalcSkill } from './skill_types.ts';

describe('defineCalcSkill', () => {
	it('returns the skill unchanged (identity function for type inference)', () => {
		const skill = defineCalcSkill({ name: 'test', description: 'a test', content: '# Test' });
		strictEqual(skill.name, 'test');
		strictEqual(skill.description, 'a test');
	});
});
