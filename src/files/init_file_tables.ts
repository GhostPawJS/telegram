import type { TelegramDb } from '../database.ts';

export function initFileTables(db: TelegramDb): void {
	db.exec(`
    CREATE TABLE IF NOT EXISTS files (
      file_id        TEXT PRIMARY KEY,
      file_unique_id TEXT NOT NULL,
      chat_id        INTEGER,
      message_id     INTEGER,
      type           TEXT NOT NULL,
      mime_type      TEXT,
      file_name      TEXT,
      file_size      INTEGER,
      width          INTEGER,
      height         INTEGER,
      duration       INTEGER,
      local_path     TEXT,
      local_hash     TEXT,
      storage_status TEXT NOT NULL DEFAULT 'remote_only' CHECK(storage_status IN ('remote_only','downloaded','failed')),
      downloaded_at  INTEGER,
      created_at     INTEGER NOT NULL,
      updated_at     INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_files_unique_id ON files(file_unique_id);
    CREATE INDEX IF NOT EXISTS idx_files_source ON files(chat_id, message_id) WHERE chat_id IS NOT NULL;
    CREATE INDEX IF NOT EXISTS idx_files_status ON files(storage_status) WHERE storage_status != 'remote_only';
  `);
}
