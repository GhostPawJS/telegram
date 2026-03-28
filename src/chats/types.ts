export type ChatType = 'private' | 'group' | 'supergroup' | 'channel';

export type AvailableReactions =
	| { mode: 'all' }
	| { mode: 'none' }
	| { mode: 'subset'; reactions: unknown[] };

export interface ChatRow {
	chat_id: number;
	type: string;
	title: string | null;
	username: string | null;
	first_name: string | null;
	last_name: string | null;
	is_forum: number;
	member_count: number | null;
	photo_file_id: string | null;
	is_active: number;
	permissions: string | null;
	available_reactions: string | null;
	last_message_at: number | null;
	metadata: string;
	created_at: number;
	updated_at: number;
}

export interface Chat {
	chatId: number;
	type: ChatType;
	title: string | null;
	username: string | null;
	firstName: string | null;
	lastName: string | null;
	isForum: boolean;
	memberCount: number | null;
	photoFileId: string | null;
	isActive: boolean;
	permissions: Record<string, unknown> | null;
	availableReactions: AvailableReactions | null;
	lastMessageAt: number | null;
	metadata: Record<string, unknown>;
	createdAt: number;
	updatedAt: number;
}

export interface ChatFilter {
	limit?: number;
	offset?: number;
	type?: ChatType;
	isActive?: boolean;
	isForum?: boolean;
}

export type ChatInput = Omit<Chat, 'createdAt' | 'updatedAt'>;
