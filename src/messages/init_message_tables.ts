import type { TelegramDb } from '../database.ts';

export function initMessageTables(db: TelegramDb): void {
	db.exec(`
    CREATE TABLE IF NOT EXISTS messages (
      chat_id           INTEGER NOT NULL,
      message_id        INTEGER NOT NULL,
      direction         TEXT NOT NULL CHECK(direction IN ('in','out')),
      date              INTEGER NOT NULL,
      from_user_id      INTEGER,
      from_username     TEXT,
      from_display_name TEXT NOT NULL,
      sender_chat_id    INTEGER,
      is_anonymous_admin INTEGER NOT NULL DEFAULT 0,
      via_bot_id        INTEGER,
      type              TEXT NOT NULL,
      service_kind      TEXT,
      text              TEXT,
      text_plain        TEXT,
      entities          TEXT,
      mentions          TEXT NOT NULL DEFAULT '[]',
      mentions_bot      INTEGER NOT NULL DEFAULT 0,
      is_reply_to_bot   INTEGER NOT NULL DEFAULT 0,
      reply_to_message_id INTEGER,
      thread_id         INTEGER,
      media_group_id    TEXT,
      forward_origin    TEXT,
      media             TEXT,
      has_media         INTEGER NOT NULL DEFAULT 0,
      reply_markup      TEXT,
      web_app_data      TEXT,
      link_preview      TEXT,
      effect_id         TEXT,
      service_data      TEXT,
      edit_date         INTEGER,
      is_deleted        INTEGER NOT NULL DEFAULT 0,
      is_pinned         INTEGER NOT NULL DEFAULT 0,
      raw               TEXT NOT NULL DEFAULT '{}',
      first_seen_at     INTEGER NOT NULL,
      updated_at        INTEGER NOT NULL,
      PRIMARY KEY (chat_id, message_id)
    );
    CREATE INDEX IF NOT EXISTS idx_messages_chat_date ON messages(chat_id, date DESC);
    CREATE INDEX IF NOT EXISTS idx_messages_user ON messages(from_user_id) WHERE from_user_id IS NOT NULL;
    CREATE INDEX IF NOT EXISTS idx_messages_thread ON messages(chat_id, thread_id) WHERE thread_id IS NOT NULL;
    CREATE INDEX IF NOT EXISTS idx_messages_album ON messages(media_group_id) WHERE media_group_id IS NOT NULL;
    CREATE INDEX IF NOT EXISTS idx_messages_reply ON messages(chat_id, reply_to_message_id) WHERE reply_to_message_id IS NOT NULL;

    CREATE VIRTUAL TABLE IF NOT EXISTS messages_fts USING fts5(
      text_plain, content='messages', content_rowid='rowid'
    );

    CREATE TRIGGER IF NOT EXISTS tg_messages_ai AFTER INSERT ON messages BEGIN
      INSERT INTO messages_fts(rowid, text_plain) VALUES (new.rowid, new.text_plain);
    END;
    CREATE TRIGGER IF NOT EXISTS tg_messages_au AFTER UPDATE ON messages BEGIN
      INSERT INTO messages_fts(messages_fts, rowid, text_plain) VALUES ('delete', old.rowid, old.text_plain);
      INSERT INTO messages_fts(rowid, text_plain) VALUES (new.rowid, new.text_plain);
    END;
    CREATE TRIGGER IF NOT EXISTS tg_messages_ad AFTER DELETE ON messages BEGIN
      INSERT INTO messages_fts(messages_fts, rowid, text_plain) VALUES ('delete', old.rowid, old.text_plain);
    END;

    CREATE TABLE IF NOT EXISTS message_edits (
      id          INTEGER PRIMARY KEY,
      chat_id     INTEGER NOT NULL,
      message_id  INTEGER NOT NULL,
      text        TEXT,
      entities    TEXT,
      media       TEXT,
      edit_date   INTEGER,
      captured_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_message_edits_msg ON message_edits(chat_id, message_id);
  `);
}
