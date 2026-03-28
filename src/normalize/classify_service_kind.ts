import type { Message } from 'grammy/types';

export function classifyServiceKind(msg: Message): string | null {
	if (msg.new_chat_members) return 'new_chat_members';
	if (msg.left_chat_member) return 'left_chat_member';
	if (msg.new_chat_title) return 'new_chat_title';
	if (msg.new_chat_photo) return 'new_chat_photo';
	if (msg.delete_chat_photo) return 'delete_chat_photo';
	if (msg.group_chat_created) return 'group_chat_created';
	if (msg.supergroup_chat_created) return 'supergroup_chat_created';
	if (msg.channel_chat_created) return 'channel_chat_created';
	if (msg.migrate_to_chat_id) return 'migrate_to_chat_id';
	if (msg.migrate_from_chat_id) return 'migrate_from_chat_id';
	if (msg.pinned_message) return 'pinned_message';
	if (msg.message_auto_delete_timer_changed) return 'message_auto_delete_timer_changed';
	if (msg.video_chat_scheduled) return 'video_chat_scheduled';
	if (msg.video_chat_started) return 'video_chat_started';
	if (msg.video_chat_ended) return 'video_chat_ended';
	if (msg.forum_topic_created) return 'forum_topic_created';
	if (msg.forum_topic_edited) return 'forum_topic_edited';
	if (msg.forum_topic_closed) return 'forum_topic_closed';
	if (msg.forum_topic_reopened) return 'forum_topic_reopened';
	if (msg.general_forum_topic_hidden) return 'general_forum_topic_hidden';
	if (msg.general_forum_topic_unhidden) return 'general_forum_topic_unhidden';
	if (msg.write_access_allowed) return 'write_access_allowed';
	return null;
}
