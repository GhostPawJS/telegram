export interface BotStateRow {
	key: string;
	value: string;
	updated_at: number;
}

export interface BotStatRow {
	stat_key: string;
	stat_value: number;
	updated_at: number;
}

export interface BotStats {
	messagesIn: number;
	messagesOut: number;
	edits: number;
	deletes: number;
	reactions: number;
	callbacks: number;
	errors: number;
	lastUpdateId: number | null;
	updatedAt: number;
}
