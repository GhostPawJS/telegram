import type { TelegramDb } from '../database.ts';

export function initMemberTables(db: TelegramDb): void {
	db.exec(`
    CREATE TABLE IF NOT EXISTS members (
      chat_id      INTEGER NOT NULL,
      user_id      INTEGER NOT NULL,
      username     TEXT,
      display_name TEXT NOT NULL,
      status       TEXT NOT NULL CHECK(status IN ('creator','administrator','member','restricted','left','kicked')),
      permissions  TEXT,
      custom_title TEXT,
      updated_at   INTEGER NOT NULL,
      PRIMARY KEY (chat_id, user_id)
    );
    CREATE INDEX IF NOT EXISTS idx_members_user ON members(user_id);
    CREATE INDEX IF NOT EXISTS idx_members_status ON members(chat_id, status);
  `);
}
