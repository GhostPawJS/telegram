import type { TelegramDb } from '../database.ts';

export function initFileTables(db: TelegramDb): void {
	db.exec(`
    CREATE TABLE IF NOT EXISTS file_blobs (
      checksum   TEXT PRIMARY KEY,
      data       BLOB NOT NULL,
      byte_size  INTEGER NOT NULL,
      created_at INTEGER NOT NULL
    );

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
      checksum       TEXT REFERENCES file_blobs(checksum),
      created_at     INTEGER NOT NULL,
      updated_at     INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_files_unique_id ON files(file_unique_id);
    CREATE INDEX IF NOT EXISTS idx_files_source ON files(chat_id, message_id) WHERE chat_id IS NOT NULL;
    CREATE INDEX IF NOT EXISTS idx_files_checksum ON files(checksum) WHERE checksum IS NOT NULL;
  `);
}
