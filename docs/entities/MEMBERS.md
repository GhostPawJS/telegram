# Members

## What It Is

`members` is the canonical record of chat membership — which user is (or was)
in which chat, at what status, and with what permissions or title.

A member row represents the relationship between one user and one chat at the
most recently observed point in time.

## Why It Exists

Chat membership changes independently of message activity. The package needs
one table that answers: who is in this chat right now, what can they do, and
have any been kicked or restricted?

## Schema

### `members`

| Field | Type | Notes |
|---|---|---|
| `chatId` | INTEGER | FK → `chats.chatId` |
| `userId` | INTEGER | FK → `users.userId` |
| `username` | TEXT | Denormalized `@handle` at time of last update |
| `displayName` | TEXT | Denormalized display name at time of last update |
| `status` | TEXT | `creator`, `administrator`, `member`, `restricted`, `left`, or `kicked` |
| `permissions` | TEXT | JSON — `ChatPermissions` object; non-NULL when `status = 'restricted'` |
| `customTitle` | TEXT | Administrator custom title, if set |
| `updatedAt` | INTEGER | Timestamp (ms) of last status change |

**Primary key:** `(chatId, userId)`

## Public API

| Function | Description |
|---|---|
| `getMember(db, chatId, userId)` | Fetch one membership row |
| `listMembers(db, chatId, options?)` | Paginated list of members for a chat |
| `upsertMember(db, member)` | Insert or replace membership state |

## Good Uses

- Checking whether a user is still an active member before sending them content
- Listing administrators (`status = 'administrator'` or `'creator'`)
- Auditing kick/restrict events by watching `status` transitions
- Displaying a roster with custom titles

## Do Not Use It For

- Tracking message activity per user (see [MESSAGES.md](MESSAGES.md))
- Storing fine-grained permission history (rows are overwritten on upsert)
- User identity or profile data (see [USERS.md](USERS.md))
