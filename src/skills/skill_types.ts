export interface CalcSkill {
	name: string;
	description: string;
	content: string;
}

export type CalcSkillRegistry = readonly CalcSkill[];

export function defineCalcSkill<TSkill extends CalcSkill>(skill: TSkill): TSkill {
	return skill;
}
