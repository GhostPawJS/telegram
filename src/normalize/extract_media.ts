import type { Message } from 'grammy/types';

export interface ExtractedMedia {
	media: Record<string, unknown> | null;
	hasMedia: boolean;
}

export function extractMedia(msg: Message): ExtractedMedia {
	if (msg.photo && msg.photo.length > 0) {
		const largest = msg.photo[msg.photo.length - 1];
		return { media: largest as unknown as Record<string, unknown>, hasMedia: true };
	}
	if (msg.document) {
		return { media: msg.document as unknown as Record<string, unknown>, hasMedia: true };
	}
	if (msg.voice) {
		return { media: msg.voice as unknown as Record<string, unknown>, hasMedia: true };
	}
	if (msg.video) {
		return { media: msg.video as unknown as Record<string, unknown>, hasMedia: true };
	}
	if (msg.video_note) {
		return { media: msg.video_note as unknown as Record<string, unknown>, hasMedia: true };
	}
	if (msg.sticker) {
		return { media: msg.sticker as unknown as Record<string, unknown>, hasMedia: true };
	}
	if (msg.animation) {
		return { media: msg.animation as unknown as Record<string, unknown>, hasMedia: true };
	}
	if (msg.audio) {
		return { media: msg.audio as unknown as Record<string, unknown>, hasMedia: true };
	}
	if (msg.location) {
		return { media: msg.location as unknown as Record<string, unknown>, hasMedia: true };
	}
	if (msg.venue) {
		return { media: msg.venue as unknown as Record<string, unknown>, hasMedia: true };
	}
	if (msg.contact) {
		return { media: msg.contact as unknown as Record<string, unknown>, hasMedia: true };
	}
	if (msg.invoice) {
		return { media: msg.invoice as unknown as Record<string, unknown>, hasMedia: true };
	}
	if (msg.game) {
		return { media: msg.game as unknown as Record<string, unknown>, hasMedia: true };
	}
	if (msg.paid_media) {
		return { media: msg.paid_media as unknown as Record<string, unknown>, hasMedia: true };
	}
	return { media: null, hasMedia: false };
}
