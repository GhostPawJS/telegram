import type { Context } from 'grammy';

export type CommandScope =
	| 'default'
	| 'all_private_chats'
	| 'all_group_chats'
	| 'all_chat_administrators';

export interface ArgDef {
	name: string;
	description: string;
	required?: boolean;
}

export interface CommandDef {
	command: string; // without slash, e.g. 'start'
	description: string;
	args?: ArgDef[];
	scope?: CommandScope;
	action: CommandAction;
}

export interface CommandContext {
	command: string;
	args: string[];
	rawText: string;
	chatId: number;
	userId: number | null;
	messageId: number;
}

export interface CommandResult {
	command: string;
	args: string[];
	rawText: string;
}

export type CommandAction = (ctx: CommandContext) => void | Promise<void>;
export type CommandMiddleware = (ctx: Context, next: () => Promise<void>) => Promise<void>;

export interface CommandRegistry {
	register(def: CommandDef): void;
	get(command: string): CommandDef | null;
	list(): CommandDef[];
}
