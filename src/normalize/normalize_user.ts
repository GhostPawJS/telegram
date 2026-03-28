import type { User as GrammyUser } from 'grammy/types';

import type { UserInput } from '../users/types.ts';

export function normalizeUser(user: GrammyUser): UserInput {
	const displayName = user.last_name
		? `${user.first_name} ${user.last_name}`
		: user.first_name || user.username || String(user.id);

	return {
		userId: user.id,
		isBot: user.is_bot,
		username: user.username ?? null,
		firstName: user.first_name,
		lastName: user.last_name ?? null,
		displayName,
		languageCode: user.language_code ?? null,
		isPremium: user.is_premium === true,
	};
}
