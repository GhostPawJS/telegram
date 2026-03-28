import type { TelegramDb } from '../database.ts';

export function initReactionTables(db: TelegramDb): void {
	db.exec(`
		CREATE TABLE IF NOT EXISTS reactions (
			chat_id      INTEGER NOT NULL,
			message_id   INTEGER NOT NULL,
			user_id      INTEGER NOT NULL,
			display_name TEXT NOT NULL,
			emoji        TEXT NOT NULL,
			emoji_type   TEXT NOT NULL CHECK(emoji_type IN ('emoji','custom_emoji','paid')),
			set_at       INTEGER NOT NULL,
			PRIMARY KEY (chat_id, message_id, user_id, emoji)
		);

		CREATE TABLE IF NOT EXISTS reaction_counts (
			chat_id    INTEGER NOT NULL,
			message_id INTEGER NOT NULL,
			emoji      TEXT NOT NULL,
			emoji_type TEXT NOT NULL,
			count      INTEGER NOT NULL DEFAULT 0,
			updated_at INTEGER NOT NULL,
			PRIMARY KEY (chat_id, message_id, emoji)
		);

		CREATE TABLE IF NOT EXISTS reaction_events (
			id         INTEGER PRIMARY KEY,
			chat_id    INTEGER NOT NULL,
			message_id INTEGER NOT NULL,
			user_id    INTEGER NOT NULL,
			emoji      TEXT NOT NULL,
			emoji_type TEXT NOT NULL,
			action     TEXT NOT NULL CHECK(action IN ('add','remove')),
			event_at   INTEGER NOT NULL
		);
		CREATE INDEX IF NOT EXISTS idx_reaction_events_msg ON reaction_events(chat_id, message_id);
		CREATE INDEX IF NOT EXISTS idx_reaction_events_user ON reaction_events(user_id);
	`);
}
