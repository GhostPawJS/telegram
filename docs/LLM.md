# LLM Usage

> This is template documentation for the calculator toy domain. Replace every
> section below with the `soul`, `tools`, and `skills` for your own domain.
> See [`../TEMPLATE.md`](../TEMPLATE.md) for a full replacement guide.

This document is for agent builders wiring `soul`, `tools`, and `skills` into
an LLM harness.

For the low-level `read` / `write` API, see [`HUMAN.md`](HUMAN.md).

## Runtime Stack

```
soul     →  thinking foundation for the system prompt
tools    →  intent-shaped actions with JSON Schema
skills   →  reusable workflow playbooks as markdown
```

The layers are additive. Each layer is independent. You can use any subset.

## Soul Layer

The soul provides a posture for the system prompt.

```ts
import { soul } from '@ghostpaw/template';

const foundation = soul.renderCalcSoulPromptFoundation();
// Inject into your system prompt.
```

`soul.calcSoul` exposes:
- `slug` — machine identifier (`'precise-accountant'`)
- `name` — display name
- `description` — one-line summary
- `essence` — extended thinking foundation
- `traits` — array of `{ principle, provenance }` objects

## Tools Layer

Two tools shaped around operator intent:

| Tool             | What it does                                    |
|------------------|-------------------------------------------------|
| `calculate`      | Perform an arithmetic operation, store it       |
| `review_history` | List recent calculations, newest-first          |

```ts
import { tools } from '@ghostpaw/template';

const allTools = tools.calcTools;
const calcTool = tools.getCalcToolByName('calculate')!;
const result = calcTool.handler(db, { a: 3, b: 4, operator: '+' });
```

Every tool returns a discriminated `ToolResult`:

```ts
if (result.ok) {
  // result.data contains the operation
} else if (result.outcome === 'error') {
  // result.error.code and result.error.message describe the failure
  // result.error.recovery gives the suggested fix
}
```

Every tool exports runtime metadata — `name`, `description`, `whenToUse`,
`whenNotToUse`, `inputSchema`, `sideEffects` — so harnesses can wire them
without reading docs.

## Skills Layer

Two workflow playbooks for common multi-step scenarios:

| Skill                         | What it covers                                   |
|-------------------------------|--------------------------------------------------|
| `compute-step-by-step`        | Decompose a multi-step expression into atomic calls |
| `review-calculation-history`  | Audit history, spot anomalies, summarise         |

```ts
import { skills } from '@ghostpaw/template';

const allSkills = skills.listCalcSkills();
const skill = skills.getCalcSkillByName('compute-step-by-step')!;
// Inject skill.content into your prompt or tool-use loop.
```

Skills are plain markdown strings. Inject `skill.content` into your agent
prompt or use it as a reasoning scaffold before calling tools.

## Design Boundary

The `soul`, `tools`, and `skills` layers are additive over the same `read` /
`write` API that human code uses. They do not add new capabilities — they
structure how an LLM reasons about and calls the existing capabilities.
