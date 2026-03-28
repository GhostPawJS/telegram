import { initBotStateTables } from './bot_state/index.ts';
import { initCallbackTables } from './callbacks/index.ts';
import { initChatTables } from './chats/index.ts';
import type { TelegramDb } from './database.ts';
import { initFileTables } from './files/index.ts';
import { initMemberTables } from './members/index.ts';
import { initMessageTables } from './messages/index.ts';
import { initReactionTables } from './reactions/index.ts';
import { initUserTables } from './users/index.ts';

/**
 * Initialises all Telegram SQLite tables in dependency order.
 */
export function initTelegramTables(db: TelegramDb): void {
	initUserTables(db);
	initChatTables(db);
	initMemberTables(db);
	initMessageTables(db);
	initFileTables(db);
	initReactionTables(db);
	initCallbackTables(db);
	initBotStateTables(db);
}
