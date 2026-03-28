import type { Member, MemberRow, MemberStatus } from './types.ts';

export function mapMemberRow(row: MemberRow): Member {
	return {
		chatId: row.chat_id,
		userId: row.user_id,
		username: row.username,
		displayName: row.display_name,
		status: row.status as MemberStatus,
		permissions: row.permissions ? (JSON.parse(row.permissions) as Record<string, unknown>) : null,
		customTitle: row.custom_title,
		updatedAt: row.updated_at,
	};
}
