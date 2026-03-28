# Users

## What It Is

`users` is the canonical record of every Telegram user this package has
observed — bot accounts and human accounts alike.

A user record captures identity fields at the time of last contact, plus
first/last-seen timestamps for activity tracking.

## Why It Exists

Messages, reactions, callbacks, and chat membership all reference a user by
ID. The package needs one place that resolves a Telegram user ID to a display
name and metadata without hitting the Telegram API on every lookup.

## Schema

### `users`

| Field | Type | Notes |
|---|---|---|
| `userId` | INTEGER | Telegram user identifier (primary key) |
| `isBot` | INTEGER | `1` if the account is a bot |
| `username` | TEXT | `@handle` without the `@`; NULL if unset |
| `firstName` | TEXT | Given name |
| `lastName` | TEXT | Family name; NULL if unset |
| `displayName` | TEXT | Computed `firstName + lastName` fallback |
| `languageCode` | TEXT | IETF language tag reported by the client |
| `isPremium` | INTEGER | `1` if the user has Telegram Premium |
| `firstSeenAt` | INTEGER | Timestamp (ms) of first observation; never overwritten |
| `lastSeenAt` | INTEGER | Timestamp (ms) updated on every upsert |

## Upsert Behavior

`upsertUser` uses an `INSERT OR REPLACE` / `ON CONFLICT` strategy that
**preserves `firstSeenAt`** from the original row while updating all other
fields and bumping `lastSeenAt`.

## Public API

| Function | Description |
|---|---|
| `getUser(db, userId)` | Fetch one user by PK |
| `listUsers(db, options?)` | Paginated list of all known users |
| `upsertUser(db, user)` | Insert or update, preserving `firstSeenAt` |
| `userChats(db, userId)` | Chat stubs where this user has been seen |
| `userMessages(db, userId, options?)` | Message stubs sent by this user |

## Good Uses

- Resolving a `fromUserId` to a display name for logging or UI
- Checking `isBot` before applying human-only interaction logic
- Activity windows via `firstSeenAt` / `lastSeenAt`

## Do Not Use It For

- Storing per-chat membership status (see [MEMBERS.md](MEMBERS.md))
- Tracking per-user reactions (see [REACTIONS.md](REACTIONS.md))
- Authentication or session management
