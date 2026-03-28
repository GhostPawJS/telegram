import type { TelegramDb } from '../database.ts';

export function initUserTables(db: TelegramDb): void {
	db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      user_id       INTEGER PRIMARY KEY,
      is_bot        INTEGER NOT NULL DEFAULT 0,
      username      TEXT,
      first_name    TEXT NOT NULL,
      last_name     TEXT,
      display_name  TEXT NOT NULL,
      language_code TEXT,
      is_premium    INTEGER NOT NULL DEFAULT 0,
      first_seen_at INTEGER NOT NULL,
      last_seen_at  INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_users_username ON users(username) WHERE username IS NOT NULL;
  `);
}
