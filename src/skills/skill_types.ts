export interface TelegramSkill {
	name: string;
	description: string;
	content: string;
}

export type TelegramSkillRegistry = readonly TelegramSkill[];

export function defineTelegramSkill<TSkill extends TelegramSkill>(skill: TSkill): TSkill {
	return skill;
}
