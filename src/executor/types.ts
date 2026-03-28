import type { ParseMode } from '../keyboards/types.ts';

export type { ParseMode };

export type MediaInput = string | Buffer | { url: string };

export interface SendMediaOpts {
	caption?: string;
	parseMode?: ParseMode;
	replyToMessageId?: number;
	replyMarkup?: unknown;
}

export interface SentMedia {
	messageId: number;
}

export interface SendOpts {
	parseMode?: ParseMode;
	replyMarkup?: unknown;
	replyToMessageId?: number;
	disablePreview?: boolean;
	disableNotification?: boolean;
	protectContent?: boolean;
	messageThreadId?: number;
}

export interface SendTextOpts extends SendOpts {
	text: string;
}

export interface SentMessage {
	chatId: number;
	messageId: number;
	date: number;
}

export interface EditOpts {
	parseMode?: ParseMode;
	replyMarkup?: unknown;
	disablePreview?: boolean;
}

export interface BroadcastOpts {
	delayMs?: number;
	onError?: (chatId: number, err: Error) => void;
}

export interface BroadcastResult {
	sent: number;
	failed: number;
	errors: Array<{ chatId: number; error: string }>;
}
