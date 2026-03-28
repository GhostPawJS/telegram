export interface CallbackRow {
	callback_id: string;
	chat_id: number;
	message_id: number;
	user_id: number;
	data: string | null;
	handler: string | null;
	payload: string | null;
	answered_at: number | null;
	expires_at: number | null;
	created_at: number;
}

export interface CallbackEntry {
	callbackId: string;
	chatId: number;
	messageId: number;
	userId: number;
	data: string | null;
	handler: string | null;
	payload: Record<string, unknown> | null;
	answeredAt: number | null;
	expiresAt: number | null;
	createdAt: number;
}

export type CallbackInput = Omit<CallbackEntry, 'createdAt'>;
