import type { TelegramDb } from '../database.ts';

export function initCallbackTables(db: TelegramDb): void {
	db.exec(`
    CREATE TABLE IF NOT EXISTS callbacks (
      callback_id TEXT PRIMARY KEY,
      chat_id     INTEGER NOT NULL,
      message_id  INTEGER NOT NULL,
      user_id     INTEGER NOT NULL,
      data        TEXT,
      handler     TEXT,
      payload     TEXT,
      answered_at INTEGER,
      expires_at  INTEGER,
      created_at  INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_callbacks_msg ON callbacks(chat_id, message_id);
    CREATE INDEX IF NOT EXISTS idx_callbacks_user ON callbacks(user_id);
    CREATE INDEX IF NOT EXISTS idx_callbacks_unanswered ON callbacks(answered_at) WHERE answered_at IS NULL;
  `);
}
