import { strictEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { computeStepByStepSkill } from './compute-step-by-step.ts';

describe('computeStepByStepSkill', () => {
	it('has the expected name and a non-empty content playbook', () => {
		strictEqual(computeStepByStepSkill.name, 'compute-step-by-step');
		strictEqual(typeof computeStepByStepSkill.description, 'string');
		strictEqual(computeStepByStepSkill.content.includes('calculate'), true);
	});
});
