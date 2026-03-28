import type { ChatMemberRestricted, ChatMember as GrammyChatMember } from 'grammy/types';

import type { Member, MemberStatus } from '../members/types.ts';

export function normalizeMember(chatId: number, member: GrammyChatMember, now?: number): Member {
	let permissions: Record<string, unknown> | null = null;

	if (member.status === 'restricted') {
		const m = member as ChatMemberRestricted;
		permissions = {
			can_send_messages: m.can_send_messages,
			can_send_audios: m.can_send_audios,
			can_send_documents: m.can_send_documents,
			can_send_photos: m.can_send_photos,
			can_send_videos: m.can_send_videos,
			can_send_video_notes: m.can_send_video_notes,
			can_send_voice_notes: m.can_send_voice_notes,
			can_send_polls: m.can_send_polls,
			can_send_other_messages: m.can_send_other_messages,
			can_add_web_page_previews: m.can_add_web_page_previews,
			can_change_info: m.can_change_info,
			can_invite_users: m.can_invite_users,
			can_pin_messages: m.can_pin_messages,
			can_manage_topics: m.can_manage_topics,
			until_date: m.until_date,
		} as Record<string, unknown>;
	}

	const displayName = member.user.last_name
		? `${member.user.first_name} ${member.user.last_name}`
		: member.user.first_name;

	return {
		chatId,
		userId: member.user.id,
		username: member.user.username ?? null,
		displayName,
		status: member.status as MemberStatus,
		permissions,
		customTitle: 'custom_title' in member ? (member.custom_title ?? null) : null,
		updatedAt: now ?? Date.now(),
	};
}
