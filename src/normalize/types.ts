import type { CallbackEntry } from '../callbacks/types.ts';
import type { Member } from '../members/types.ts';
import type { StoredMessage } from '../messages/types.ts';
import type { User } from '../users/types.ts';

export interface IncomingMessage {
	message: StoredMessage;
	user: User | null;
}

export interface CallbackEvent {
	callback: CallbackEntry;
	user: User | null;
}

export interface MemberUpdateEvent {
	chatId: number;
	member: Member;
	oldMember: Member | null;
}

export interface ReactionUpdateEvent {
	chatId: number;
	messageId: number;
	userId: number;
	oldReactions: string[];
	newReactions: string[];
}

export interface PollAnswerEvent {
	pollId: string;
	userId: number;
	optionIds: number[];
}

export interface JoinRequestEvent {
	chatId: number;
	user: User;
	inviteLink: string | null;
}

export type MessageHandler = (event: IncomingMessage) => void | Promise<void>;
export type EditedMessageHandler = (event: IncomingMessage) => void | Promise<void>;
export type CallbackHandler = (event: CallbackEvent) => void | Promise<void>;
export type MemberUpdateHandler = (event: MemberUpdateEvent) => void | Promise<void>;
export type ReactionHandler = (event: ReactionUpdateEvent) => void | Promise<void>;
export type PollAnswerHandler = (event: PollAnswerEvent) => void | Promise<void>;
export type JoinRequestHandler = (event: JoinRequestEvent) => void | Promise<void>;
export type DeepLinkHandler = (event: IncomingMessage, payload: string) => void | Promise<void>;
