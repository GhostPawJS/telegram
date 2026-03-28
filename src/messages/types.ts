export type MessageType =
	| 'text'
	| 'photo'
	| 'document'
	| 'voice'
	| 'video'
	| 'video_note'
	| 'sticker'
	| 'animation'
	| 'audio'
	| 'location'
	| 'venue'
	| 'contact'
	| 'poll'
	| 'dice'
	| 'story'
	| 'game'
	| 'web_app_data'
	| 'service'
	| 'other';

export interface MessageRow {
	chat_id: number;
	message_id: number;
	direction: string;
	date: number;
	from_user_id: number | null;
	from_username: string | null;
	from_display_name: string;
	sender_chat_id: number | null;
	is_anonymous_admin: number;
	via_bot_id: number | null;
	type: string;
	service_kind: string | null;
	text: string | null;
	text_plain: string | null;
	entities: string | null;
	mentions: string;
	mentions_bot: number;
	is_reply_to_bot: number;
	reply_to_message_id: number | null;
	thread_id: number | null;
	media_group_id: string | null;
	forward_origin: string | null;
	media: string | null;
	has_media: number;
	reply_markup: string | null;
	web_app_data: string | null;
	link_preview: string | null;
	effect_id: string | null;
	service_data: string | null;
	edit_date: number | null;
	is_deleted: number;
	is_pinned: number;
	raw: string;
	first_seen_at: number;
	updated_at: number;
}

export interface StoredMessage {
	chatId: number;
	messageId: number;
	direction: 'in' | 'out';
	date: number;
	fromUserId: number | null;
	fromUsername: string | null;
	fromDisplayName: string;
	senderChatId: number | null;
	isAnonymousAdmin: boolean;
	viaBotId: number | null;
	type: MessageType;
	serviceKind: string | null;
	text: string | null;
	textPlain: string | null;
	entities: unknown[] | null;
	mentions: number[];
	mentionsBot: boolean;
	isReplyToBot: boolean;
	replyToMessageId: number | null;
	threadId: number | null;
	mediaGroupId: string | null;
	forwardOrigin: Record<string, unknown> | null;
	media: Record<string, unknown> | null;
	hasMedia: boolean;
	replyMarkup: Record<string, unknown> | null;
	webAppData: Record<string, unknown> | null;
	linkPreview: Record<string, unknown> | null;
	effectId: string | null;
	serviceData: Record<string, unknown> | null;
	editDate: number | null;
	isDeleted: boolean;
	isPinned: boolean;
	raw: Record<string, unknown>;
	firstSeenAt: number;
	updatedAt: number;
}

export interface MessageEdit {
	id: number;
	chatId: number;
	messageId: number;
	text: string | null;
	entities: unknown[] | null;
	media: Record<string, unknown> | null;
	editDate: number | null;
	capturedAt: number;
}

export interface MessageEditRow {
	id: number;
	chat_id: number;
	message_id: number;
	text: string | null;
	entities: string | null;
	media: string | null;
	edit_date: number | null;
	captured_at: number;
}

export interface MessageQuery {
	chatId: number;
	limit?: number;
	offset?: number;
	before?: number;
	after?: number;
	direction?: 'in' | 'out';
	threadId?: number;
	type?: MessageType;
	includeDeleted?: boolean;
}

export interface SearchOpts {
	limit?: number;
	highlightStart?: string;
	highlightEnd?: string;
}

export interface SearchResult {
	chatId: number;
	messageId: number;
	date: number;
	snippet: string;
}

export interface ThreadSummary {
	chatId: number;
	threadId: number;
	total: number;
	firstDate: number;
	lastDate: number;
	participantCount: number;
}

export type MessageInput = Omit<StoredMessage, 'firstSeenAt' | 'updatedAt'>;
