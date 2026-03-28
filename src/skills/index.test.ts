import { strictEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
	calcSkills,
	computeStepByStepSkill,
	defineCalcSkill,
	getCalcSkillByName,
	listCalcSkills,
	reviewCalculationHistorySkill,
} from './index.ts';

describe('skills barrel', () => {
	it('exports all expected symbols', () => {
		strictEqual(typeof defineCalcSkill, 'function');
		strictEqual(typeof listCalcSkills, 'function');
		strictEqual(typeof getCalcSkillByName, 'function');
		strictEqual(Array.isArray(calcSkills), true);
		strictEqual(typeof computeStepByStepSkill.name, 'string');
		strictEqual(typeof reviewCalculationHistorySkill.name, 'string');
	});
});
