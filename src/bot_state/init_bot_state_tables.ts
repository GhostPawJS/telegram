import type { TelegramDb } from '../database.ts';

export function initBotStateTables(db: TelegramDb): void {
	db.exec(`
    CREATE TABLE IF NOT EXISTS bot_state (
      key        TEXT PRIMARY KEY,
      value      TEXT NOT NULL,
      updated_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS bot_stats (
      stat_key   TEXT PRIMARY KEY,
      stat_value INTEGER NOT NULL DEFAULT 0,
      updated_at INTEGER NOT NULL
    );
  `);
}
