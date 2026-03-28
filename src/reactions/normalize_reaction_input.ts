import type { EmojiType, ReactionInput } from './types.ts';

export function normalizeReactionInput(r: ReactionInput): { emoji: string; emojiType: EmojiType } {
	if (typeof r === 'string') return { emoji: r, emojiType: 'emoji' };
	if (r.type === 'paid') return { emoji: 'paid', emojiType: 'paid' };
	if (r.type === 'custom_emoji') return { emoji: r.customEmojiId, emojiType: 'custom_emoji' };
	return { emoji: r.emoji, emojiType: 'emoji' };
}
