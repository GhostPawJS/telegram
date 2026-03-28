# @ghostpaw/template

[![npm](https://img.shields.io/npm/v/@ghostpaw/template)](https://www.npmjs.com/package/@ghostpaw/template)
[![node](https://img.shields.io/node/v/@ghostpaw/template)](https://nodejs.org)
[![license](https://img.shields.io/npm/l/@ghostpaw/template)](LICENSE)
[![dependencies](https://img.shields.io/badge/dependencies-0-brightgreen)](package.json)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Live Demo](https://img.shields.io/badge/demo-live-06d6a0?style=flat&logo=github)](https://ghostpawjs.github.io/template)

TODO: one-line description of what this package does.

> This is the GhostPaw template repository. The calculator domain below is toy
> content — a working example to copy from and replace. See
> [TEMPLATE.md](TEMPLATE.md) for a full map of what to keep, what to replace,
> and a step-by-step checklist.

## Install

```bash
npm install @ghostpaw/template
```

Requires **Node.js 24+** (uses the built-in `node:sqlite` module).

## Quick Start

```ts
import { DatabaseSync } from 'node:sqlite';
import { initCalcTables, read, write } from '@ghostpaw/template';

const db = new DatabaseSync(':memory:');
initCalcTables(db);

const r1 = write.add(db, 10, 5);
const r2 = write.multiply(db, r1.result, 2);

const history = read.listHistory(db);
```

## Two Audiences

### Human developers

Use the `read` and `write` namespaces for direct-code access to every domain
operation:

```ts
import { read, write } from '@ghostpaw/template';

write.add(db, 3, 4);
write.divide(db, 10, 2);

const history = read.listHistory(db);
const last = read.getLastResult(db);
```

See [HUMAN.md](docs/HUMAN.md) for the full human-facing guide.

### LLM agents

Use the `tools`, `skills`, and `soul` namespaces for a structured runtime
surface designed to minimise LLM cognitive load:

```ts
import { tools, skills, soul } from '@ghostpaw/template';

// Intent-shaped tools with JSON Schema inputs and structured results
const allTools = tools.calcTools;
const calcTool = tools.getCalcToolByName('calculate')!;
const result = calcTool.handler(db, { a: 3, b: 4, operator: '+' });

// Reusable workflow skills for common multi-step scenarios
const allSkills = skills.listCalcSkills();

// Thinking foundation for system prompts
const prompt = soul.renderCalcSoulPromptFoundation();
```

Every tool returns a discriminated result with `outcome: 'success' | 'no_op' |
'needs_clarification' | 'error'`, structured data, next-step hints, and
actionable recovery advice.

See [LLM.md](docs/LLM.md) for the full AI-facing guide.

## Tools

| Tool             | What it does                                    |
|------------------|-------------------------------------------------|
| `calculate`      | Perform an arithmetic operation, store it       |
| `review_history` | List recent calculations, newest-first          |

## Key Properties

- **Zero runtime dependencies.** Only `node:sqlite` (built into Node 24+).
- **Single prebundled blob.** One ESM + one CJS entry in `dist/`.
- **Pure SQLite storage.** Bring your own `DatabaseSync` instance.
- **Append-only history.** Operations are never modified after insertion.
- **Additive AI runtime.** `soul` for posture, `tools` for actions, `skills`
  for workflow guidance — all optional, all structured.
- **Colocated tests.** Every non-type module has a colocated `.test.ts` file.

## Package Surface

```ts
import {
  initCalcTables,  // schema setup
  read,            // all query functions
  write,           // all mutation functions
  tools,           // LLM tool definitions + registry
  skills,          // LLM workflow skills + registry
  soul,            // thinking foundation for system prompts
} from '@ghostpaw/template';
```

## Documentation

| Document | Audience |
|---|---|
| [HUMAN.md](docs/HUMAN.md) | Human developers using the low-level `read` / `write` API |
| [LLM.md](docs/LLM.md) | Agent builders wiring `soul`, `tools`, and `skills` into LLM systems |
| [docs/README.md](docs/README.md) | Architecture overview and source layout |
| [docs/entities/](docs/entities/) | Per-entity manuals with exact public API listings |

## Development

```bash
npm install
npm test            # node:test runner
npm run typecheck   # tsc --noEmit
npm run lint        # biome check
npm run build       # ESM + CJS + declarations via tsup
npm run demo:serve  # build and serve the interactive demo locally
```

The repo is pinned to **Node 24.14.0** via `.nvmrc` / `.node-version` /
`.tool-versions` / Volta.

### Support

If this package helps your project, consider sponsoring its maintenance:

[![GitHub Sponsors](https://img.shields.io/badge/Sponsor-EA4AAA?style=for-the-badge&logo=github&logoColor=white)](https://github.com/sponsors/Anonyfox)

---

**[Anonyfox](https://anonyfox.com) • [MIT License](LICENSE)**
