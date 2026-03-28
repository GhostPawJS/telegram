import { computeStepByStepSkill } from './compute-step-by-step.ts';
import { reviewCalculationHistorySkill } from './review-calculation-history.ts';
import type { CalcSkillRegistry } from './skill_types.ts';

export const calcSkills = [
	computeStepByStepSkill,
	reviewCalculationHistorySkill,
] satisfies CalcSkillRegistry;

export function listCalcSkills() {
	return [...calcSkills];
}

export function getCalcSkillByName(name: string) {
	return calcSkills.find((skill) => skill.name === name) ?? null;
}
