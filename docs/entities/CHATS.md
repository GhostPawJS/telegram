# Chats

## What It Is

`chats` is the canonical record of every Telegram conversation this package
has observed — private DMs, groups, supergroups, and channels.

A chat record captures the current state of the conversation's metadata: its
type, title, activity flag, and optional configuration blobs.

## Why It Exists

Messages and members both hang off a chat. The package needs one table that
answers: what kind of conversation is this, is it still active, and what are
its current settings?

## Schema

### `chats`

| Field | Type | Notes |
|---|---|---|
| `chatId` | INTEGER | Telegram chat identifier (primary key) |
| `type` | TEXT | `private`, `group`, `supergroup`, or `channel` |
| `title` | TEXT | Display name; NULL for private chats |
| `username` | TEXT | Public `@handle`; NULL if private/no username |
| `isForum` | INTEGER | `1` if the supergroup has topics/forum mode enabled |
| `memberCount` | INTEGER | Last-known participant count |
| `isActive` | INTEGER | `0` after migration or the bot is removed |
| `permissions` | TEXT | JSON — default member permissions object |
| `availableReactions` | TEXT | JSON array of allowed reaction emoji |
| `lastMessageAt` | INTEGER | Timestamp (ms) of the most recent message |
| `metadata` | TEXT | JSON blob for extension data (e.g. migration IDs) |

## Migration Handling

`handleMigration(db, fromChatId, toChatId)` is called when a group is
upgraded to a supergroup. It:

1. Sets `isActive = 0` on the old `fromChatId` row.
2. Stores `{ migratedTo: toChatId }` in `fromChatId.metadata`.
3. Stores `{ migratedFrom: fromChatId }` in `toChatId.metadata`.

## Public API

| Function | Description |
|---|---|
| `getChat(db, chatId)` | Fetch one chat by PK |
| `listChats(db, options?)` | Paginated list; filterable by `isActive` |
| `upsertChat(db, chat)` | Insert or update chat metadata |
| `handleMigration(db, fromChatId, toChatId)` | Mark old chat inactive, link migration IDs |

## Good Uses

- Resolving a `chatId` to a title or type before processing
- Checking `isForum` to decide whether to use `threadId` routing
- Filtering to `isActive = 1` chats for scheduled broadcasts
- Auditing group-to-supergroup migrations via `metadata`

## Do Not Use It For

- Tracking per-user membership (see [MEMBERS.md](MEMBERS.md))
- Storing message history (see [MESSAGES.md](MESSAGES.md))
- Bot configuration or feature flags (use a separate config entity)
