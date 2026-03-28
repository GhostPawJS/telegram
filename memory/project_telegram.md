---
name: "@ghostpaw/telegram — project overview"
description: What we're building, current skeleton state, architecture plan
type: project
---

Building `@ghostpaw/telegram`: a standalone Node.js Telegram bot channel engine on top of `grammy` + `marked` + SQLite.

**Why:** Provides protocol, storage, rendering, and lifecycle substrate for Telegram bot presence — not a chatbot framework, not an app. Part of the GhostPawJS monorepo family alongside `@ghostpaw/grimoire`, `@ghostpaw/codex`, etc.

## Current state (2026-03-28)
- Package skeleton cloned from `@ghostpaw/template` — still named `@ghostpaw/template` in package.json
- `src/` has template placeholder files: `calculations/`, `init_calc_tables.ts`, plus the shared boilerplate: `database.ts`, `errors.ts`, `index.ts`, `read.ts`, `write.ts`, `types.ts`, `soul.ts`, `tools/`, `skills/`, `lib/`, `demo/`, etc.
- **grammy** and **marked** not yet added as runtime deps
- No entity modules yet (users/, chats/, members/, messages/, files/, reactions/, callbacks/, bot_state/)
- No behavioral modules yet (transport/, normalize/, executor/, streaming/, commands/, keyboards/, render/)

## Build plan (step by step)
1. Fix package.json: rename to `@ghostpaw/telegram`, add grammy + marked deps
2. Remove template cruft: calculations/, init_calc_tables.ts
3. Fill in core files: database.ts, errors.ts, defaults.ts, types.ts, with_transaction.ts, resolve_now.ts
4. Build entity modules bottom-up: users, chats, members, messages, files, reactions, callbacks, bot_state
5. Build behavioral modules: render, keyboards, normalize, commands, transport, executor, streaming
6. Build surfaces: read.ts, write.ts, network.ts, render.ts
7. Build bot.ts (porcelain composition)
8. Build tools + skills + soul
9. Wire index.ts barrel
10. Integration tests + demo

## Architecture highlights
- 5 public surfaces: read, write, network, render, createBot
- Strict layer ordering (database → entities → behavioral → surfaces → porcelain)
- Entity modules never import each other — cross joins happen in read.ts or normalize/
- node:test + node:assert exclusively, in-memory SQLite for tests
- grammy mocked in tests via lib/mock_grammy.ts
- tsup for dual CJS/ESM, biome for lint/format

**How to apply:** Follow the layer ordering strictly. Build and test bottom-up.
