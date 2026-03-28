import type { Message } from 'grammy/types';

import type { MessageType } from '../messages/types.ts';

export function classifyMessageType(msg: Message): MessageType {
	if (msg.text) return 'text';
	if (msg.photo) return 'photo';
	if (msg.document) return 'document';
	if (msg.voice) return 'voice';
	if (msg.video) return 'video';
	if (msg.video_note) return 'video_note';
	if (msg.sticker) return 'sticker';
	if (msg.animation) return 'animation';
	if (msg.audio) return 'audio';
	if (msg.location) return 'location';
	if (msg.venue) return 'venue';
	if (msg.contact) return 'contact';
	if (msg.poll) return 'poll';
	if (msg.dice) return 'dice';
	if (msg.story) return 'story';
	if (msg.game) return 'game';
	if (msg.web_app_data) return 'web_app_data';
	if (
		msg.new_chat_members ||
		msg.left_chat_member ||
		msg.new_chat_title ||
		msg.new_chat_photo ||
		msg.delete_chat_photo ||
		msg.group_chat_created ||
		msg.supergroup_chat_created ||
		msg.channel_chat_created ||
		msg.migrate_to_chat_id ||
		msg.migrate_from_chat_id ||
		msg.pinned_message ||
		msg.message_auto_delete_timer_changed ||
		msg.video_chat_scheduled ||
		msg.video_chat_started ||
		msg.video_chat_ended ||
		msg.forum_topic_created ||
		msg.forum_topic_edited ||
		msg.forum_topic_closed ||
		msg.forum_topic_reopened ||
		msg.general_forum_topic_hidden ||
		msg.general_forum_topic_unhidden ||
		msg.write_access_allowed
	)
		return 'service';
	return 'other';
}
