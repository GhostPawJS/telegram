/** Structural Bot API types for the fields consumed by this package. */
export interface User {
	id: number;
	is_bot: boolean;
	first_name: string;
	last_name?: string | undefined;
	username?: string | undefined;
	language_code?: string | undefined;
	is_premium?: boolean | undefined;
	added_to_attachment_menu?: boolean | undefined;
}
export interface Chat {
	id: number;
	type: 'private' | 'group' | 'supergroup' | 'channel';
	title?: string | undefined;
	username?: string | undefined;
	first_name?: string | undefined;
	last_name?: string | undefined;
	is_forum?: boolean | undefined;
}
export interface MessageEntity {
	type: string;
	offset: number;
	length: number;
	user?: User | undefined;
	url?: string | undefined;
	language?: string | undefined;
	custom_emoji_id?: string | undefined;
}
export interface PhotoSize {
	file_id: string;
	file_unique_id: string;
	width: number;
	height: number;
	file_size?: number | undefined;
}
export interface Document {
	file_id: string;
	file_unique_id: string;
	file_size?: number | undefined;
	file_name?: string | undefined;
	mime_type?: string | undefined;
	thumbnail?: PhotoSize | undefined;
}
export interface Voice extends Document {
	duration: number;
}
export interface Video extends Voice {
	width: number;
	height: number;
}
export interface VideoNote extends Voice {
	length: number;
}
export interface Sticker extends Document {
	width: number;
	height: number;
}
export interface Message {
	message_id: number;
	date: number;
	chat: Chat;
	from?: User | undefined;
	sender_chat?: Chat | undefined;
	via_bot?: User | undefined;
	text?: string | undefined;
	caption?: string | undefined;
	entities?: MessageEntity[] | undefined;
	caption_entities?: MessageEntity[] | undefined;
	reply_to_message?: Message | undefined;
	message_thread_id?: number | undefined;
	media_group_id?: string | undefined;
	forward_origin?: object | undefined;
	reply_markup?: object | undefined;
	web_app_data?: { data: string; button_text: string };
	link_preview_options?: object | undefined;
	effect_id?: string | undefined;
	edit_date?: number | undefined;
	photo?: PhotoSize[] | undefined;
	document?: Document | undefined;
	voice?: Voice | undefined;
	video?: Video | undefined;
	video_note?: VideoNote | undefined;
	audio?: Voice | undefined;
	animation?: Video | undefined;
	sticker?: Sticker | undefined;
	location?: object | undefined;
	venue?: object | undefined;
	contact?: object | undefined;
	invoice?: object | undefined;
	game?: object | undefined;
	paid_media?: object | undefined;
	poll?: object | undefined;
	dice?: object;
	story?: object;
	new_chat_members?: User[] | undefined;
	left_chat_member?: User | undefined;
	new_chat_title?: string | undefined;
	new_chat_photo?: PhotoSize[] | undefined;
	delete_chat_photo?: boolean | undefined;
	group_chat_created?: boolean | undefined;
	supergroup_chat_created?: boolean | undefined;
	channel_chat_created?: boolean | undefined;
	migrate_to_chat_id?: number | undefined;
	migrate_from_chat_id?: number | undefined;
	pinned_message?: { message_id: number };
	message_auto_delete_timer_changed?: object | undefined;
	video_chat_scheduled?: object | undefined;
	video_chat_started?: object | undefined;
	video_chat_ended?: object | undefined;
	forum_topic_created?: object | undefined;
	forum_topic_edited?: object | undefined;
	forum_topic_closed?: object | undefined;
	forum_topic_reopened?: object | undefined;
	general_forum_topic_hidden?: object | undefined;
	general_forum_topic_unhidden?: object | undefined;
	write_access_allowed?: object | undefined;
}
export interface ChatMember {
	status: 'creator' | 'administrator' | 'member' | 'restricted' | 'left' | 'kicked';
	user: User;
	custom_title?: string | undefined;
}
export interface ChatMemberRestricted extends ChatMember {
	can_send_messages: boolean;
	can_send_audios: boolean;
	can_send_documents: boolean;
	can_send_photos: boolean;
	can_send_videos: boolean;
	can_send_video_notes: boolean;
	can_send_voice_notes: boolean;
	can_send_polls: boolean;
	can_send_other_messages: boolean;
	can_add_web_page_previews: boolean;
	can_change_info: boolean;
	can_invite_users: boolean;
	can_pin_messages: boolean;
	can_manage_topics: boolean;
	until_date: number;
}
export interface CallbackQuery {
	id: string;
	from: User;
	message?: { chat: Chat; message_id: number };
	data?: string | undefined;
}
export interface ChatMemberUpdated {
	chat: Chat;
	from: User;
	date: number;
	old_chat_member: ChatMember;
	new_chat_member: ChatMember;
}
export interface ReactionType {
	type: string;
	emoji?: string | undefined;
	custom_emoji_id?: string | undefined;
}
export interface Update {
	update_id: number;
	message?: Message | undefined;
	edited_message?: Message | undefined;
	callback_query?: CallbackQuery | undefined;
	my_chat_member?: ChatMemberUpdated | undefined;
	chat_member?: ChatMemberUpdated | undefined;
	poll_answer?: object | undefined;
	chat_join_request?: object | undefined;
	message_reaction?:
		| {
				chat: Chat;
				message_id: number;
				user?: User | undefined;
				old_reaction?: ReactionType[] | undefined;
				new_reaction?: ReactionType[];
		  }
		| undefined;
	message_reaction_count?: {
		chat: Chat;
		message_id: number;
		reactions?: { type: ReactionType; total_count: number }[];
	};
}
/** Minimum context accepted by the command middleware; compatible with grammy Context. */
export interface Context {
	message?: Message | undefined;
	chat?: Chat | undefined;
	from?: User | undefined;
}
export interface MenuBot {
	api: {
		setMyCommands(
			commands: { command: string; description: string }[],
			options: {
				scope: {
					type: 'default' | 'all_private_chats' | 'all_group_chats' | 'all_chat_administrators';
				};
			},
		): Promise<unknown>;
	};
}
