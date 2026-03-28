# @ghostpaw/telegram

[![npm](https://img.shields.io/npm/v/@ghostpaw/telegram)](https://www.npmjs.com/package/@ghostpaw/telegram)
[![node](https://img.shields.io/node/v/@ghostpaw/telegram)](https://nodejs.org)
[![license](https://img.shields.io/npm/l/@ghostpaw/telegram)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org)

Telegram bot channel engine — grammy transport, SQLite message mirror with FTS5 full-text search, eager file BLOB storage, markdown rendering, and a structured LLM tool facade.

Every incoming update is mirrored into a local SQLite database before your handler runs, giving you a persistent, queryable record of everything the bot sees — including the raw bytes of every photo, document, voice message, and video, downloaded and stored immediately on receipt. It ships as a single prebundled blob designed for two audiences at once: human developers building bot backends in code, and LLM agents operating through a structured tool facade.

## Install

```bash
npm install @ghostpaw/telegram
```

Requires **Node.js 24+** (uses the built-in `node:sqlite` module).

## Quick Start

```ts
import { DatabaseSync } from 'node:sqlite';
import { createBot, initTelegramTables } from '@ghostpaw/telegram';

const db = new DatabaseSync('bot.db');
initTelegramTables(db);

const bot = createBot({
  token: process.env.TELEGRAM_TOKEN!,
  db,
  onMessage: async ({ message, user }) => {
    console.log(user?.firstName, message.text);
  },
});

await bot.start(); // long-polling
```

Webhook mode — pass a `webhook` config instead:

```ts
const bot = createBot({
  token: process.env.TELEGRAM_TOKEN!,
  db,
  webhook: { path: '/webhook', port: 8443, secretToken: process.env.TG_SECRET },
  onMessage: async ({ message, user }) => { /* ... */ },
});

await bot.start(); // listens on port 8443
```

## What It Stores

Every update is mirrored into SQLite before your handler runs:

- **Messages** — text, media, edits, reply edges, albums, threads (FTS5 full-text index with Unicode diacritic folding)
- **Users** — first name, last name, username, language code
- **Chats** — title, type, member count, forum flag
- **Members** — status, permissions, admin title per chat
- **Reactions** — emoji per user per message, with per-emoji counts and event log
- **Files** — metadata + raw bytes stored as BLOB, SHA-256 deduplicated; downloaded eagerly on receipt
- **Callbacks** — inline button presses with data and answered state
- **Bot state** — arbitrary key/value store and running statistics

All eight tables are created in one call: `initTelegramTables(db)`.

## Two Audiences

### Human developers

Use the `read`, `write`, and `network` namespaces for direct-code access to every domain operation:

```ts
import { read, write, network } from '@ghostpaw/telegram';

// query the local mirror — no network calls
const chat = read.getChat(db, chatId);
const messages = read.listMessages(db, { chatId, limit: 50 });
const results = read.searchMessages(db, chatId, 'invoice');
const chain = read.replyChain(db, chatId, messageId);

// retrieve a stored file blob
const bytes = write.getFileBlob(db, fileId); // Buffer | null

// send text and media
await write.sendMessage(bot, chatId, 'Hello');
await write.sendPhoto(bot, chatId, fileId);
await write.sendDocument(bot, chatId, buffer, { caption: 'Report' });
await write.broadcast(bot, chatIds, 'Announcement');

// streaming — progressive in-place edits
const stream = write.createStream(bot, { chatId });
await stream.append('Thinking...');
await stream.replace('Done.');
```

See [docs/HUMAN.md](docs/HUMAN.md) for the full human-facing guide with worked examples.

### LLM agents

Use the `tools`, `skills`, and `soul` namespaces for a structured runtime surface:

```ts
import { tools, skills, soul } from '@ghostpaw/telegram';

// 4 JSON-schema tools with structured ToolResult responses
const allTools = tools.telegramTools;
const readTool = tools.getTelegramToolByName('tg_read');
const result = readTool?.handler(db, { subcommand: 'search_messages', chatId, query: 'invoice' });

// 6 workflow playbooks for common multi-step scenarios
const allSkills = skills.telegramSkills;

// Herald persona for system prompts
const prompt = soul.renderTelegramSoulPromptFoundation();
```

Every tool returns a discriminated result with `outcome: 'success' | 'no_op' | 'error'`, structured data, and next-step hints. No thrown exceptions to parse.

See [docs/LLM.md](docs/LLM.md) for the full AI-facing guide covering soul, tools, and skills.

## Package Surface

| Export | Role |
|---|---|
| `initTelegramTables(db)` | One-shot DDL — call once at startup |
| `createBot(config)` | Full bot composition over grammy; polling or webhook |
| `adaptBot(grammy)` | Bridge a raw grammy `Bot` to the `MockBot` executor interface |
| `read` | Query the local SQLite mirror (no network) |
| `write` | Send messages, media, and actions; manage file BLOBs |
| `keyboards` | Build inline keyboards and callback buttons |
| `network` | Manage polling and update dispatch |
| `render` | Pure markdown and text transformation |
| `tools` | 4 JSON-schema tools for LLM agents |
| `skills` | 6 workflow playbooks for LLM agents |
| `soul` | Herald persona for system prompts |
| `DEFAULTS` | Tuneable runtime constants |

## Tools

Four tools shaped around operator intent:

| Tool | What it does |
|---|---|
| `tg_read` | Query messages, chats, users, reactions, edit history, reply chains |
| `tg_send` | Send, edit, delete, forward, pin messages; set reactions; broadcast |
| `tg_manage` | Ban, unban, restrict, promote, kick users; query member status |
| `tg_connect` | Get bot stats, read bot state, list active chats |

Each tool exports runtime metadata — name, description, JSON Schema, side-effect level, `readOnly` flag — so agent harnesses can wire them without reading docs.

## Skills

Six workflow playbooks as markdown strings:

| Skill | Workflow |
|---|---|
| `manage-telegram-conversations` | Read context, reply, pin, track threads and albums |
| `moderate-chat-effectively` | Detect violations, warn, restrict, ban with audit trail |
| `handle-group-administration` | Promote, demote, migrate, configure permissions |
| `broadcast-to-audience` | Compose, send, handle errors, retry failed chats |
| `search-and-retrieve-messages` | Full-text search, reply chains, edit history |
| `stream-progressive-responses` | Debounced streaming with overflow and error recovery |

## Documentation

| Document | Audience |
|---|---|
| [docs/HUMAN.md](docs/HUMAN.md) | Human developers using the `read`/`write`/`network` API |
| [docs/LLM.md](docs/LLM.md) | Agent builders wiring tools, skills, and soul |
| [docs/RECIPES.md](docs/RECIPES.md) | Advanced UI/UX patterns: streaming, approval flows, pagination |
| [docs/README.md](docs/README.md) | Architecture overview: storage model, surfaces, invariants |
| [docs/entities/](docs/entities/) | Per-entity manuals with exact public API listings |

## Development

```bash
npm install
npm test            # node:test runner
npm run typecheck   # tsc --noEmit
npm run lint        # biome check
npm run build       # ESM + CJS + declarations via tsup
```

The repo is pinned to **Node 24.14.0** via Volta. Use whichever version manager you prefer.

### Support

If this package helps your project, consider sponsoring its maintenance:

[![GitHub Sponsors](https://img.shields.io/badge/Sponsor-EA4AAA?style=for-the-badge&logo=github&logoColor=white)](https://github.com/sponsors/Anonyfox)

---

**[Anonyfox](https://anonyfox.com) • [MIT License](LICENSE)**
