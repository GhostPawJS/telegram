export type ParseMode = 'HTML' | 'MarkdownV2' | 'Markdown';
export type MediaType = 'photo' | 'video' | 'document' | 'audio' | 'animation';

export type AdminRights = {
	can_manage_chat?: boolean;
	can_post_messages?: boolean;
	can_edit_messages?: boolean;
	can_delete_messages?: boolean;
	can_manage_video_chats?: boolean;
	can_restrict_members?: boolean;
	can_promote_members?: boolean;
	can_change_info?: boolean;
	can_invite_users?: boolean;
	can_pin_messages?: boolean;
	can_manage_topics?: boolean;
	can_post_stories?: boolean;
	can_edit_stories?: boolean;
	can_delete_stories?: boolean;
	is_anonymous?: boolean;
};

export type ChatPermissions = {
	can_send_messages?: boolean;
	can_send_audios?: boolean;
	can_send_documents?: boolean;
	can_send_photos?: boolean;
	can_send_videos?: boolean;
	can_send_video_notes?: boolean;
	can_send_voice_notes?: boolean;
	can_send_polls?: boolean;
	can_send_other_messages?: boolean;
	can_add_web_page_previews?: boolean;
	can_change_info?: boolean;
	can_invite_users?: boolean;
	can_pin_messages?: boolean;
	can_manage_topics?: boolean;
};

// Inline keyboard button variants (discriminated by which key is present)
export type InlineButton =
	| { text: string; callback_data: string }
	| { text: string; url: string }
	| { text: string; switch_inline_query: string }
	| { text: string; switch_inline_query_current_chat: string }
	| {
			text: string;
			login_url: {
				url: string;
				forward_text?: string;
				bot_username?: string;
				request_write_access?: boolean;
			};
	  }
	| { text: string; web_app: { url: string } };

// Reply keyboard button variants
export type KeyboardButton =
	| { text: string }
	| { text: string; request_contact: true }
	| { text: string; request_location: true }
	| { text: string; request_poll: { type?: 'quiz' | 'regular' } }
	| { text: string; web_app: { url: string } };

export type ReplyMarkup =
	| InlineKeyboardMarkup
	| ReplyKeyboardMarkup
	| ReplyKeyboardRemove
	| ForceReply;

export interface InlineKeyboardMarkup {
	inline_keyboard: InlineButton[][];
}

export interface ReplyKeyboardMarkup {
	keyboard: KeyboardButton[][];
	resize_keyboard?: boolean;
	one_time_keyboard?: boolean;
	input_field_placeholder?: string;
	selective?: boolean;
	is_persistent?: boolean;
}

export interface ReplyKeyboardRemove {
	remove_keyboard: true;
	selective?: boolean;
}

export interface ForceReply {
	force_reply: true;
	input_field_placeholder?: string;
	selective?: boolean;
}

export type InputFile = string; // file_id, URL, or local path

export interface InputMediaBase {
	media: InputFile;
	caption?: string;
	parse_mode?: ParseMode;
}

export interface InputMediaPhoto extends InputMediaBase {
	type: 'photo';
}

export interface InputMediaVideo extends InputMediaBase {
	type: 'video';
	width?: number;
	height?: number;
	duration?: number;
	supports_streaming?: boolean;
}

export interface InputMediaDocument extends InputMediaBase {
	type: 'document';
}

export interface InputMediaAudio extends InputMediaBase {
	type: 'audio';
	duration?: number;
	performer?: string;
	title?: string;
}

export interface InputMediaAnimation extends InputMediaBase {
	type: 'animation';
	width?: number;
	height?: number;
	duration?: number;
}

export type InputMedia =
	| InputMediaPhoto
	| InputMediaVideo
	| InputMediaDocument
	| InputMediaAudio
	| InputMediaAnimation;
