# Human Usage

Direct-code usage guide for `@ghostpaw/telegram`.

For agent builders wiring this into an LLM harness, read [LLM.md](LLM.md) instead.

## Setup

```ts
import { DatabaseSync } from 'node:sqlite';
import { createBot, initTelegramTables } from '@ghostpaw/telegram';

const db = new DatabaseSync('bot.db');
initTelegramTables(db); // idempotent — safe to call on every restart

const bot = createBot({
  token: process.env.TELEGRAM_TOKEN!,
  db,
  onMessage:        async ({ message, user, chat, reply }) => { /* ... */ },
  onEditedMessage:  async ({ message, user }) => { /* ... */ },
  onCallback:       async ({ callback, user, chat, answer }) => { /* ... */ },
  onMemberUpdate:   async ({ chatId, member, oldMember }) => { /* ... */ },
  onReaction:       async ({ chatId, messageId, userId, oldReactions, newReactions }) => { /* ... */ },
  onPollAnswer:     async (ctx) => { /* ... */ },
  onJoinRequest:    async (ctx) => { /* ... */ },
});

await bot.start(); // begins long-polling
bot.stop();        // graceful shutdown
```

Webhook mode — pass `webhook` instead:

```ts
const bot = createBot({
  token: process.env.TELEGRAM_TOKEN!,
  db,
  webhook: { path: '/webhook', port: 8443, secretToken: process.env.TG_SECRET },
  onMessage: async ({ message, user }) => { /* ... */ },
});

await bot.start(); // HTTP server on port 8443; stop() closes it cleanly
```

`initTelegramTables` initialises all tables in dependency order (users → chats → members → messages → files → reactions → callbacks → bot_state). `TelegramDb` is satisfied directly by `DatabaseSync`.

Every incoming message with media (photo, document, voice, video, audio, animation, sticker, video_note) is eagerly downloaded and stored as a BLOB in SQLite before your handler is called.

## Reading Data (`read`)

All `read` functions take `db` as the first argument and never call the Telegram API.

### Users

| Function | Returns |
|---|---|
| `read.getUser(db, userId)` | User row or `null` |
| `read.listUsers(db, opts?)` | User rows, `limit` (default 50) |
| `read.userChats(db, userId)` | Chats the user has appeared in |
| `read.userMessages(db, userId, opts?)` | Messages sent by the user |

### Chats

| Function | Returns |
|---|---|
| `read.getChat(db, chatId)` | Chat row or `null` |
| `read.listChats(db, opts?)` | Chat rows, `limit` (default 50) |

### Members

| Function | Returns |
|---|---|
| `read.getMember(db, chatId, userId)` | Member row or `null` |
| `read.listMembers(db, chatId, opts?)` | Member rows; filter by `status` |

### Messages

| Function | Returns |
|---|---|
| `read.getMessage(db, chatId, messageId)` | Message row or `null` |
| `read.listMessages(db, opts)` | Messages; filter by `chatId`, `before`/`after` (ms), `threadId`, `limit` |
| `read.searchMessages(db, chatId, query, opts?)` | FTS5 full-text results with snippets; Unicode diacritic folding — "cafe" matches "café" |
| `read.replyChain(db, chatId, messageId)` | Reply-to ancestors root-first, up to `maxDepth` (default 50) |
| `read.album(db, chatId, mediaGroupId)` | All messages in a media album |
| `read.threadSummary(db, chatId, threadId)` | Aggregate stats for a forum topic thread |
| `read.editHistory(db, chatId, messageId)` | All captured edits in chronological order |

`searchMessages` uses FTS5 on `text_plain`. Cross-chat search is not supported — always supply `chatId`.

### Reactions, Files, Callbacks, State

| Function | Returns |
|---|---|
| `read.getReactions(db, chatId, messageId)` | All reaction rows for a message |
| `read.getReactionCounts(db, chatId, messageId)` | Emoji → count map |
| `read.userReactions(db, userId)` | All reactions left by a user |
| `read.getFile(db, fileId)` | File metadata row or `null` |
| `read.listFiles(db, opts?)` | File rows; filter by `type`, `chatId`, `hasBlob` (true = downloaded, false = pending) |
| `read.getCallbacks(db, opts?)` | Callback rows |
| `read.getStats(db)` | Aggregate counts (messages, users, chats, etc.) |
| `read.getState(db, key)` | Stored bot state value or `null` |

Files store the largest photo resolution, main media file, and thumbnails for video/audio/document. Retrieve the raw bytes with `write.getFileBlob(db, fileId)` → `Buffer | null`. Any file where the background download failed has `checksum: null` and can be retried with `write.downloadFile(bot, db, fileId)`.

## Sending Messages and Media (`write`)

All `write` functions take a `MockBot` (or grammy `Bot` via `adaptBot`) as the first argument and return a `Promise`.

### Text

| Function | What it does |
|---|---|
| `write.sendMessage(bot, chatId, text, opts?)` | Send a text message; returns `SentMessage` |
| `write.editMessage(bot, chatId, messageId, text, opts?)` | Edit an existing message |
| `write.deleteMessage(bot, chatId, messageId)` | Delete a message |
| `write.forwardMessage(bot, toChatId, fromChatId, messageId)` | Forward a message |
| `write.broadcast(bot, chatIds, text, opts?)` | Send the same message to many chats with back-pressure |

### Media

Each media send accepts `MediaInput`: a `string` (file_id), `Buffer`, or `{ url: string }`.

| Function | What it does |
|---|---|
| `write.sendPhoto(bot, chatId, photo, opts?)` | Send a photo |
| `write.sendDocument(bot, chatId, document, opts?)` | Send a document |
| `write.sendVoice(bot, chatId, voice, opts?)` | Send a voice message |
| `write.sendAudio(bot, chatId, audio, opts?)` | Send an audio file |
| `write.sendVideo(bot, chatId, video, opts?)` | Send a video |

`SendMediaOpts`: `caption?`, `parseMode?`, `replyToMessageId?`, `replyMarkup?`.

### File BLOBs

| Function | What it does |
|---|---|
| `write.downloadFile(bot, db, fileId)` | Download a file from Telegram into SQLite BLOB; returns updated `FileEntry` |
| `write.storeFileBlob(db, fileId, buffer)` | Store raw bytes into SQLite; SHA-256 deduplication; returns updated `FileEntry` |
| `write.getFileBlob(db, fileId)` | Retrieve stored bytes; returns `Buffer \| null` |

### Actions and Keyboards

| Function | What it does |
|---|---|
| `write.answerCallback(bot, callbackId, opts?)` | Answer an inline button press |
| `write.setReaction(bot, chatId, messageId, emoji)` | Set a reaction on a message |
| `write.sendChatAction(bot, chatId, action)` | Send a typing/upload indicator (`ChatAction`) |
| `write.pinMessage(bot, chatId, messageId)` | Pin a message |
| `write.unpinMessage(bot, chatId, messageId)` | Unpin a message |

Build inline keyboards with the `keyboards` namespace:

```ts
import { keyboards, write } from '@ghostpaw/telegram';

const markup = keyboards.inlineKeyboard([
  [keyboards.callbackButton('✅ Yes', 'confirm:yes'), keyboards.callbackButton('❌ No', 'confirm:no')],
  [keyboards.urlButton('Docs', 'https://github.com/GhostPawJS/telegram')],
]);

await write.sendMessage(bot, chatId, 'Proceed?', { replyMarkup: markup });
```

### Streaming

`write.createStream(bot, opts)` returns a `StreamHandle` for progressive in-place edits:

```ts
const stream = write.createStream(bot, { chatId, parseMode: 'HTML' });

// fire-and-forget with debounce (good for token-by-token LLM output)
stream.write('<b>chunk</b> ');

// immediate flush — good for explicit progress steps
await stream.append('Step 1 done\n');
await stream.append('Step 2 done\n');

// replace entire buffer and flush immediately
await stream.replace('Final answer.');

await stream.end(); // flush and mark done
stream.text;        // accumulated text so far
stream.done;        // true after end() resolves
```

`StreamOpts`: `chatId`, `messageId?`, `parseMode?`, `debounceMs?` (default 300), `maxLength?` (default 4096), `onError?`. Omit `messageId` to send a new message and edit in-place; provide it to start editing an existing one.

`broadcast` returns `BroadcastResult: { sent: number; failed: number; errors: Array<{ chatId, error }> }`.

## Network (`network`)

Low-level transport layer for custom polling loops.

| Function | What it does |
|---|---|
| `network.startPolling(ctx, opts?)` | Starts the update loop; fire-and-forget, driven by `ctx.signal` |
| `network.dispatchUpdate(update, handlers)` | Route a single grammy `Update` to an `UpdateHandlerMap` |
| `network.createConnectionState()` | Create a fresh `ConnectionState` (status `'disconnected'`) |
| `network.transitionState(state, event)` | Pure transition — returns new `ConnectionState` |

`PollingContext` requires: `getUpdates`, `getMe`, `onUpdate`, `onError`, `signal` (AbortSignal).

## Rendering (`render`)

Pure functions — no I/O, no grammy dependency.

| Function | What it does |
|---|---|
| `render.markdownToHtml(md)` | Convert CommonMark markdown to Telegram HTML |
| `render.markdownToMarkdownV2(md)` | Convert CommonMark markdown to Telegram MarkdownV2 |
| `render.escapeHtml(s)` | Escape `<`, `>`, `&` for safe Telegram HTML |
| `render.escapeMarkdownV2(s)` | Escape all MarkdownV2 reserved characters |
| `render.splitText(text, maxLength?)` | Split text into chunks at `maxLength` (default 4096) on word boundaries |
| `render.splitCaption(text)` | Split text at the caption limit (1024) |

Always render before sending — Telegram's parse modes are strict. Use `markdownToHtml` + `parseMode: 'HTML'` for most cases.

## Error Handling

```ts
import { isTelegramError, TelegramNotFoundError, TelegramValidationError } from '@ghostpaw/telegram';

try {
  await write.sendMessage(bot, chatId, text);
} catch (err) {
  if (err instanceof TelegramNotFoundError) {
    // chat not found or bot was removed
  } else if (isTelegramError(err)) {
    console.error(err.code, err.message);
  }
}
```

| Class | Code | When thrown |
|---|---|---|
| `TelegramNotFoundError` | `TELEGRAM_NOT_FOUND` | Chat or message does not exist |
| `TelegramValidationError` | `TELEGRAM_VALIDATION` | Invalid input (empty text, bad parse mode, etc.) |
| `TelegramStateError` | `TELEGRAM_STATE` | Bot is in an invalid state for the requested action |
| `TelegramRateLimitError` | `TELEGRAM_RATE_LIMIT` | Telegram 429 response |
| `TelegramTransportError` | `TELEGRAM_TRANSPORT` | Network-level failure |
| `TelegramApiError` | `TELEGRAM_API` | Other Telegram API error |
| `TelegramFileError` | `TELEGRAM_FILE` | File download or upload failure |

`isTelegramError(e)` narrows any `unknown` to `TelegramError`.
