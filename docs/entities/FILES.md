# Files

## What It Is

`files` is the canonical record of every media file this package has
encountered — photos, documents, voice messages, videos, stickers, and more.

A file row tracks both the Telegram-side reference (fileId / fileUniqueId) and
the local storage state (path, hash, download status).

## Why It Exists

Telegram file IDs are session-scoped and can expire. The package needs one
table that answers: have we already downloaded this file, where is it locally,
and does our copy still match what we downloaded?

## Schema

### `files`

| Field | Type | Notes |
|---|---|---|
| `fileId` | TEXT | Telegram `file_id` (session-scoped; may change) |
| `fileUniqueId` | TEXT | Telegram `file_unique_id` — stable across sessions (primary key) |
| `chatId` | INTEGER | Chat the file was first seen in |
| `messageId` | INTEGER | Message the file was first seen in |
| `type` | TEXT | `photo`, `document`, `voice`, `video`, `audio`, `sticker`, `animation`, etc. |
| `mimeType` | TEXT | MIME type string; NULL if unknown |
| `fileName` | TEXT | Original filename for documents; NULL otherwise |
| `fileSize` | INTEGER | Size in bytes; NULL if Telegram did not report it |
| `width` | INTEGER | Pixel width for images/video; NULL otherwise |
| `height` | INTEGER | Pixel height for images/video; NULL otherwise |
| `duration` | INTEGER | Duration in seconds for audio/video; NULL otherwise |
| `localPath` | TEXT | Absolute path to the downloaded file; NULL until downloaded |
| `localHash` | TEXT | SHA-256 hex digest of the local file; NULL until downloaded |
| `storageStatus` | TEXT | `remote_only`, `downloaded`, or `failed` |
| `downloadedAt` | INTEGER | Timestamp (ms) when download completed; NULL otherwise |

## `updateStorageStatus` Behavior

When called with `status = 'downloaded'`, `updateStorageStatus` sets
`localPath`, `localHash`, `storageStatus`, and `downloadedAt` atomically.
For `status = 'failed'` it sets only `storageStatus` and clears `localPath` /
`localHash`.

## Public API

| Function | Description |
|---|---|
| `getFile(db, fileUniqueId)` | Fetch one file record by stable unique ID |
| `listFiles(db, options?)` | Paginated list; filterable by `storageStatus` or `type` |
| `upsertFile(db, file)` | Insert or update file metadata (refreshes `fileId`) |
| `updateStorageStatus(db, fileUniqueId, status, localPath?, localHash?)` | Record download outcome |

## Good Uses

- Avoiding redundant downloads by checking `storageStatus` before fetching
- Serving locally cached media without re-requesting from Telegram
- Integrity checks using `localHash` after download or on startup

## Do Not Use It For

- Storing file contents in the database (keep files on disk; store the path)
- Tracking which users have access to a file (that is a permissions concern)
- Message-level media metadata beyond what is needed for storage (see
  [MESSAGES.md](MESSAGES.md) `media` field for caption/thumb data)
