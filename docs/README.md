# Docs

> This folder is template documentation. The content below describes the
> calculator toy domain. Replace it with documentation for your own domain.
> See [`../TEMPLATE.md`](../TEMPLATE.md) for a full replacement guide.

This folder is the operator and implementer manual for this package.

The source of truth for the public API lives in `src/`. These docs describe
what each concept is for, why it exists, how it should be used, and which
public APIs belong to it.

## Manuals

- [`HUMAN.md`](HUMAN.md) — human developer usage guide
- [`LLM.md`](LLM.md) — agent builder guide covering soul, tools, and skills
- [`entities/CALCULATIONS.md`](entities/CALCULATIONS.md) — operations entity manual

## Core Separations

- `operations` own the arithmetic record: operands, operator, result, timestamp
- `read` surfaces are derived from stored operations at query time
- `tools`, `skills`, and `soul` are additive runtime layers over the same direct-code API

## Architecture

```
src/
├── calculations/     entity: one file per operation, colocated tests
├── lib/              test helpers: openTestDatabase, createInitializedCalcDb
├── tools/            LLM tool definitions with JSON Schema
├── skills/           LLM workflow playbooks as markdown
├── soul.ts           thinking foundation for system prompts
├── read.ts           query namespace barrel
├── write.ts          mutation namespace barrel
├── init_calc_tables.ts  one-shot DDL for the full schema
├── resolve_now.ts    injectable clock for testable timestamps
└── with_transaction.ts  nested-savepoint transaction helper
```
