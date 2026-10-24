# @ghostpaw/telegram

Telegram transport, SQLite message mirror, rendering, and structured tools for Node.js.

## Use

Install with `npm install @ghostpaw/telegram` in a consuming project.

```ts
import { DatabaseSync } from 'node:sqlite';
import { createBot, initTelegramTables, write } from '@ghostpaw/telegram';
const db = new DatabaseSync('telegram.db');
db.exec('PRAGMA journal_mode = WAL; PRAGMA busy_timeout = 5000');
initTelegramTables(db);
const bot = createBot({ token: process.env.TELEGRAM_TOKEN!, db });
await write.sendMessage(bot.client, 123, 'Hello');
```

The caller owns the database connection. For file databases, enable WAL and
busy_timeout=5000 before use. The package does not open a file database.

Tools live in `src/tools/` and are exported through `tools`.
`tools.telegramTools` contains synchronous plan handlers.
Results have `{ ok, outcome, summary, next? }` plus `data` on success or
`error` on failure. `tools.createTelegramToolFacade({ client: bot.client,
execute: true })` adds an async `handler(db, name, input)` that executes send
and moderation plans. Omitting execute keeps plan-only behavior.
The facade defaults to one action per second per chat, 30 globally, and two
retries for Telegram retry_after responses. Configure perChatPerSecond,
globalPerSecond, maxRetries, now, and sleep at construction.

## Layout

- `src/bot.ts`: bot lifecycle and incoming updates.
- `src/executor/`: outbound actions; `src/streaming/`: progressive messages.
- `src/messages/`, `src/chats/`, `src/users/`, `src/members/`: SQLite storage.
- `src/render/`, `src/normalize/`: rendering and incoming data conversion.
- `src/tools/`, `src/skills/`: structured tool definitions and workflows.
- `tests/`: built ESM/CommonJS integration checks (build before testing).
- `docs/`: detailed usage documentation.

## Contribute

Use Node 24. Run `npm run lint`, `npm run typecheck`, `npm test`, and
`npm run build`. Build first when testing from a clean checkout.
Use node:test and node:assert, with *.test.ts next to source for unit tests.
Built artifact integration tests live in tests/ and run through npm test.
Assert real behavior; preserve existing assertions and coverage.

Runtime dependencies are grammy and marked. `npm run check:deps` allows
exactly those two. Adding any other runtime dependency is not allowed.
Load these dependencies synchronously on first use, keeping ESM and CJS working.
Keep exported APIs, tool names and fields, CLI flags, database schemas, and
synchronous behavior compatible. Make additive changes only.
Record changes under Unreleased in CHANGELOG.md in neutral maintainer prose.
Leave `.github/workflows/disabled` intact.

Release with `npm run release:patch` or `npm run release:minor`; these scripts
version and tag the package and push so CI publishes with provenance.
Maintainers run releases after review; leave task changes uncommitted.
