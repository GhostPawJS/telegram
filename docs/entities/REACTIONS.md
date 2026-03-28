# Reactions

## What It Is

`reactions` tracks emoji reactions on messages across three tables: the
current per-user state, aggregate counts, and an immutable event log.

## Why It Exists

Telegram delivers reactions as a full replacement snapshot, not a delta. The
package needs to diff old vs. new state, derive the add/remove events, keep
running totals, and retain a history — none of which Telegram provides
natively.

## Schema

### `reactions` — per-user current state

| Field | Type | Notes |
|---|---|---|
| `chatId` | INTEGER | FK → `chats.chatId` |
| `messageId` | INTEGER | FK → `messages.messageId` |
| `userId` | INTEGER | FK → `users.userId` |
| `emoji` | TEXT | The reaction emoji string |
| `createdAt` | INTEGER | Timestamp (ms) when first added |

**Primary key:** `(chatId, messageId, userId, emoji)`

### `reaction_counts` — aggregate totals per emoji

| Field | Type | Notes |
|---|---|---|
| `chatId` | INTEGER | |
| `messageId` | INTEGER | |
| `emoji` | TEXT | |
| `count` | INTEGER | Running total |

**Primary key:** `(chatId, messageId, emoji)`

### `reaction_events` — immutable event log

| Field | Type | Notes |
|---|---|---|
| `eventId` | INTEGER | Auto-increment PK |
| `chatId` | INTEGER | |
| `messageId` | INTEGER | |
| `userId` | INTEGER | |
| `displayName` | TEXT | Denormalized at event time |
| `emoji` | TEXT | |
| `action` | TEXT | `'add'` or `'remove'` |
| `createdAt` | INTEGER | Timestamp (ms) |

## `applyReactionUpdate` Behavior

`applyReactionUpdate(db, chatId, messageId, userId, displayName, oldReactions, newReactions)`

1. Diffs `oldReactions` against `newReactions` to find added and removed emoji.
2. Inserts new rows into `reactions`; deletes removed rows.
3. Appends one `reaction_events` row per added/removed emoji.
4. The operation is **idempotent** — re-applying the same update produces no
   duplicate events.

## Public API

| Function | Description |
|---|---|
| `getReactions(db, chatId, messageId)` | All current per-user reactions for a message |
| `getReactionCounts(db, chatId, messageId)` | Aggregate emoji totals for a message |
| `userReactions(db, chatId, userId)` | All messages a user has reacted to in a chat |
| `applyReactionUpdate(db, chatId, messageId, userId, displayName, oldReactions, newReactions)` | Diff and persist a reaction snapshot |
| `applyReactionCounts(db, chatId, messageId, counts)` | Overwrite `reaction_counts` from a Telegram-supplied totals array |

## Good Uses

- Displaying live reaction counts on messages
- Notifying when the bot's message receives a reaction
- Auditing reaction history via `reaction_events`

## Do Not Use It For

- Storing inline keyboard button presses (see [CALLBACKS.md](CALLBACKS.md))
- Vote tallying where ballot integrity matters (event log is append-only but
  not cryptographically signed)
