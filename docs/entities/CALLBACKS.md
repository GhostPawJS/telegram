# Callbacks

## What It Is

`callbacks` is the canonical record of inline keyboard callback queries this
package has received — the button presses that Telegram delivers as
`callback_query` updates.

A callback row ties a Telegram callback ID to the message and user that
generated it, the data payload, and whether it has been answered.

## Why It Exists

Callback queries must be answered within a Telegram-enforced timeout or the
button shows an error spinner. The package needs one table that answers: has
this query already been answered, when does it expire, and what handler should
process it?

## Schema

### `callbacks`

| Field | Type | Notes |
|---|---|---|
| `callbackId` | TEXT | Telegram's `callback_query.id` string (primary key) |
| `chatId` | INTEGER | Chat the originating message belongs to |
| `messageId` | INTEGER | Message whose inline keyboard was pressed |
| `userId` | INTEGER | User who pressed the button |
| `data` | TEXT | Raw `callback_query.data` string sent by the client |
| `handler` | TEXT | Logical handler name resolved from `data` at insert time |
| `payload` | TEXT | JSON — structured arguments parsed from `data` |
| `answeredAt` | INTEGER | Timestamp (ms) when `answerCallbackQuery` was called; NULL until answered |
| `expiresAt` | INTEGER | Timestamp (ms) after which Telegram will no longer accept an answer |
| `createdAt` | INTEGER | Timestamp (ms) when the row was inserted |

## Idempotency

`insertCallback` uses `INSERT OR IGNORE` on `callbackId`. Re-delivering the
same `callback_query` update will not create a duplicate row or overwrite
`answeredAt`.

`markAnswered` is a no-op if `answeredAt` is already set.

## Public API

| Function | Description |
|---|---|
| `getCallbacks(db, options?)` | List callbacks; filterable by `chatId`, `messageId`, answered state |
| `insertCallback(db, callback)` | Idempotent insert; silently ignores duplicate `callbackId` |
| `markAnswered(db, callbackId, now?)` | Set `answeredAt`; no-op if already answered |

## Good Uses

- Deduplicating repeated deliveries of the same callback query
- Checking whether a callback has already been answered before calling the
  Telegram API
- Auditing which buttons were pressed, by whom, and when

## Do Not Use It For

- Storing inline query results (`inline_query` updates are a different type)
- Long-lived state machines (use a dedicated state/session entity instead)
- Reactions or message votes (see [REACTIONS.md](REACTIONS.md))
