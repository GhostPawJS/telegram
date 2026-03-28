import { strictEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { getCalcSkillByName, listCalcSkills } from './skill_registry.ts';

describe('skill registry', () => {
	it('lists all skills', () => {
		const skills = listCalcSkills();
		strictEqual(skills.length, 2);
	});

	it('finds skills by name', () => {
		strictEqual(getCalcSkillByName('compute-step-by-step')?.name, 'compute-step-by-step');
		strictEqual(
			getCalcSkillByName('review-calculation-history')?.name,
			'review-calculation-history',
		);
		strictEqual(getCalcSkillByName('nonexistent'), null);
	});
});
