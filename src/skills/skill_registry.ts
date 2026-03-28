import { broadcastToAudience } from './broadcast-to-audience.ts';
import { handleGroupAdministration } from './handle-group-administration.ts';
import { manageTelegramConversations } from './manage-telegram-conversations.ts';
import { moderateChatEffectively } from './moderate-chat-effectively.ts';
import { searchAndRetrieveMessages } from './search-and-retrieve-messages.ts';
import type { TelegramSkillRegistry } from './skill_types.ts';
import { streamProgressiveResponses } from './stream-progressive-responses.ts';

export const telegramSkills: TelegramSkillRegistry = [
	manageTelegramConversations,
	handleGroupAdministration,
	streamProgressiveResponses,
	moderateChatEffectively,
	searchAndRetrieveMessages,
	broadcastToAudience,
];

export function listTelegramSkills() {
	return [...telegramSkills];
}

export function getTelegramSkillByName(name: string) {
	return telegramSkills.find((skill) => skill.name === name) ?? null;
}
