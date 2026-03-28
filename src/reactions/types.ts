export type ReactionInput =
	| string
	| { type: 'emoji'; emoji: string }
	| { type: 'custom_emoji'; customEmojiId: string }
	| { type: 'paid' };
export type EmojiType = 'emoji' | 'custom_emoji' | 'paid';

export interface ReactionRow {
	chat_id: number;
	message_id: number;
	user_id: number;
	display_name: string;
	emoji: string;
	emoji_type: string;
	set_at: number;
}

export interface ReactionCountRow {
	chat_id: number;
	message_id: number;
	emoji: string;
	emoji_type: string;
	count: number;
	updated_at: number;
}

export interface ReactionEventRow {
	id: number;
	chat_id: number;
	message_id: number;
	user_id: number;
	emoji: string;
	emoji_type: string;
	action: string;
	event_at: number;
}

export interface UserReaction {
	userId: number;
	displayName: string;
	emoji: string;
	emojiType: EmojiType;
	setAt: number;
}

export interface ReactionCount {
	emoji: string;
	emojiType: EmojiType;
	count: number;
	updatedAt: number;
}

export interface UserReactionSummary {
	chatId: number;
	messageId: number;
	emoji: string;
	emojiType: EmojiType;
	setAt: number;
}
