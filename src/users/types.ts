export interface UserRow {
	user_id: number;
	is_bot: number;
	username: string | null;
	first_name: string;
	last_name: string | null;
	display_name: string;
	language_code: string | null;
	is_premium: number;
	first_seen_at: number;
	last_seen_at: number;
}

export interface User {
	userId: number;
	isBot: boolean;
	username: string | null;
	firstName: string;
	lastName: string | null;
	displayName: string;
	languageCode: string | null;
	isPremium: boolean;
	firstSeenAt: number;
	lastSeenAt: number;
}

export interface UserFilter {
	limit?: number;
	offset?: number;
	isBot?: boolean;
}

export type UserInput = Omit<User, 'firstSeenAt' | 'lastSeenAt'>;

export interface UserChatStub {
	chatId: number;
	type: string;
	title: string | null;
	username: string | null;
	isActive: boolean;
}

export interface UserMessageStub {
	chatId: number;
	messageId: number;
	date: number;
	text: string | null;
	type: string;
}
