import type { TelegramDb } from '../database.ts';

export function initChatTables(db: TelegramDb): void {
	db.exec(`
    CREATE TABLE IF NOT EXISTS chats (
      chat_id             INTEGER PRIMARY KEY,
      type                TEXT NOT NULL CHECK(type IN ('private','group','supergroup','channel')),
      title               TEXT,
      username            TEXT,
      first_name          TEXT,
      last_name           TEXT,
      is_forum            INTEGER NOT NULL DEFAULT 0,
      member_count        INTEGER,
      photo_file_id       TEXT,
      is_active           INTEGER NOT NULL DEFAULT 1,
      permissions         TEXT,
      available_reactions TEXT,
      last_message_at     INTEGER,
      metadata            TEXT NOT NULL DEFAULT '{}',
      created_at          INTEGER NOT NULL,
      updated_at          INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_chats_type ON chats(type);
    CREATE INDEX IF NOT EXISTS idx_chats_active ON chats(is_active) WHERE is_active = 1;
  `);
}
