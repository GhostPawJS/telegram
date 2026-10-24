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
- `src/bot_api/`, `src/telegram_types.ts`: fetch client, uploads, and structural Bot API types.
- `src/executor/`: outbound actions; `src/streaming/`: progressive messages.
- `src/messages/`, `src/chats/`, `src/users/`, `src/members/`: SQLite storage.
- `src/render/`, `src/normalize/`: rendering and incoming data conversion.
- `src/tools/`, `src/skills/`: structured tool definitions and workflows.
- `tests/`: built ESM/CommonJS integration checks (build before testing).
- `src/surfaces/`: shared MCP, stdio, CLI, skill and manifest renderers.
- `src/surface/`: Telegram bindings; `src/mcp.ts`, `src/cli.ts`, `src/mcp_server_bin.ts` are entries.
- `scripts/surfaces/`: generates `SKILL.md`, `skills/telegram/`, `plugin.json`, `mcp.json`, `.claude-plugin/`, `server.json`, `glama.json`, and `mcpb/manifest.json`. Run `npm run surfaces`; do not edit generated outputs.
- `scripts/guard/`: size, API, consumer, startup and ratchet guards; `scripts/bench/`: benchmarks.
- `docs/`: detailed usage documentation.

## Contribute

Use Node 24. `npm run check` is the single gate: types, lint, tests, build,
zero runtime dependencies, generated surfaces, size budgets, API snapshot,
packed consumer, startup budgets, and ratchet. Also run `npm run test:dist`.
Use node:test and node:assert, with *.test.ts next to source for unit tests.
Built artifact integration tests live in tests/; run npm run test:dist after building.
Assert real behavior; preserve existing assertions and coverage.

The package has zero runtime dependencies. Do not add runtime dependencies.
`npm run check:deps` checks the manifest and built package.
grammy and marked are development dependencies for compatibility tests only.
Keep exported APIs, tool names and fields, CLI flags, database schemas, and
synchronous behavior compatible. Make additive changes only.
Budget increases require `[budget-increase-approved]`, API snapshot changes
require `[api-change-approved]`, and guard, workflow or lint changes require
`[guardrails-change-approved]` in the reviewed commit message.
Record changes under Unreleased in CHANGELOG.md in neutral maintainer prose.
Leave `.github/workflows/disabled` intact.

Release with `npm run release:patch` or `npm run release:minor`; these scripts
version and tag the package and push so CI publishes with provenance.
Maintainers run releases after review; leave task changes uncommitted.
