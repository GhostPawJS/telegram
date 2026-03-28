# Messages

## What It Is

`messages` is the canonical record of every Telegram message this package has
observed — inbound and outbound, text and media, service events and normal
conversation.

A message is one discrete unit of chat history: who sent it, in which chat, at
what time, with what content, and whether it has since been edited or deleted.

## Why It Exists

Every meaningful event in a Telegram conversation is anchored to a message. The
package needs a single table that answers: what was said, by whom, in which
chat, in what order, and how has it changed since?

## Schema

### `messages`

| Field | Type | Notes |
|---|---|---|
| `chatId` | INTEGER | Telegram chat identifier |
| `messageId` | INTEGER | Telegram message identifier (unique within chat) |
| `direction` | TEXT | `'in'` or `'out'` |
| `date` | INTEGER | Unix timestamp in **milliseconds** |
| `fromUserId` | INTEGER | Sender's user ID; NULL for anonymous/channel posts |
| `type` | TEXT | `text`, `photo`, `document`, `voice`, `sticker`, etc. |
| `serviceKind` | TEXT | Non-NULL for service messages (e.g. `pinned_message`, `new_chat_members`) |
| `text` | TEXT | Raw text with HTML/Markdown entities intact |
| `textPlain` | TEXT | Stripped plain-text used for FTS |
| `entities` | TEXT | JSON array of Telegram `MessageEntity` objects |
| `mentions` | TEXT | JSON array of usernames/IDs extracted from entities |
| `mentionsBot` | INTEGER | `1` if the bot is mentioned |
| `isReplyToBot` | INTEGER | `1` if this is a direct reply to the bot |
| `replyToMessageId` | INTEGER | `messageId` of the parent, if any |
| `threadId` | INTEGER | Forum thread (message_thread_id) |
| `mediaGroupId` | TEXT | Groups album frames together |
| `hasMedia` | INTEGER | `1` if any media is attached |
| `media` | TEXT | JSON blob — file references, caption, etc. |
| `isDeleted` | INTEGER | `1` after soft-delete |
| `isPinned` | INTEGER | `1` while pinned |
| `editDate` | INTEGER | Timestamp (ms) of last edit; NULL if never edited |
| `raw` | TEXT | Full Telegram `Message` JSON for forward compatibility |

### `messages_fts`

FTS5 virtual table over `textPlain`. Three triggers keep it in sync:

- `messages_ai` — after insert
- `messages_au` — after update of `textPlain`
- `messages_ad` — after delete

### `message_edits`

Captures a snapshot of `text`, `textPlain`, `entities`, and `editDate`
**before** each edit is applied. Rows are append-only.

## Public API

| Function | Description |
|---|---|
| `getMessage(db, chatId, messageId)` | Fetch one message by PK |
| `listMessages(db, chatId, options?)` | Paginated list for a chat |
| `insertMessage(db, msg)` | Insert a new message |
| `updateMessage(db, chatId, messageId, patch)` | Patch fields on an existing message |
| `applyEdit(db, chatId, messageId, newText, editDate)` | Snapshot to `message_edits`, then update |
| `softDelete(db, chatId, messageId)` | Set `isDeleted=1`; row is retained |
| `replyChain(db, chatId, messageId)` | Walk `replyToMessageId` links upward |
| `album(db, chatId, mediaGroupId)` | All frames of a media group |
| `threadSummary(db, chatId, threadId)` | Metadata for a forum thread |
| `searchMessages(db, chatId, query, options?)` | FTS5 full-text search |
| `editHistory(db, chatId, messageId)` | Ordered snapshots from `message_edits` |

## Good Uses

- Conversation retrieval and context assembly for bot responses
- Full-text search across a chat archive
- Edit/deletion audit trail
- Album and thread reconstruction

## Do Not Use It For

- Storing sending state or outbox queues (that belongs in a jobs/queue layer)
- Aggregating reaction counts (see [REACTIONS.md](REACTIONS.md))
- Storing file binaries or download state (see [FILES.md](FILES.md))
