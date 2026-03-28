export type MemberStatus =
	| 'creator'
	| 'administrator'
	| 'member'
	| 'restricted'
	| 'left'
	| 'kicked';

export interface MemberRow {
	chat_id: number;
	user_id: number;
	username: string | null;
	display_name: string;
	status: string;
	permissions: string | null;
	custom_title: string | null;
	updated_at: number;
}

export interface Member {
	chatId: number;
	userId: number;
	username: string | null;
	displayName: string;
	status: MemberStatus;
	permissions: Record<string, unknown> | null;
	customTitle: string | null;
	updatedAt: number;
}
