# Human Usage

> This is template documentation for the calculator toy domain. Replace every
> section below with the `read` / `write` API for your own domain.
> See [`../TEMPLATE.md`](../TEMPLATE.md) for a full replacement guide.

This document is for human operators and developers using this package directly
in code via the `read` and `write` namespaces.

If you are wiring it into an LLM agent, read [`LLM.md`](LLM.md) instead.
Domain vocabulary lives in [`../CONCEPT.md`](../CONCEPT.md).

## Which Surface To Use

```ts
import { initCalcTables, read, write } from '@ghostpaw/template';
```

Use this surface when a human is deciding what to compute, reviewing history,
or building application logic on top of the stored operations.

## Package Imports

| Symbol            | Role                                             |
|-------------------|--------------------------------------------------|
| `initCalcTables`  | One-shot DDL — call once with your DatabaseSync  |
| `read`            | Query namespace: `listHistory`, `getLastResult`  |
| `write`           | Mutation namespace: `add`, `subtract`, `multiply`, `divide`, `clearHistory` |
| `types`           | Shared TypeScript types and enums               |
| `errors`          | Error classes and `isCalcError` guard           |
| `CalcDb`          | Type alias for the database interface            |

## Minimal Session

```ts
import { DatabaseSync } from 'node:sqlite';
import { initCalcTables, read, write } from '@ghostpaw/template';

const db = new DatabaseSync(':memory:');
initCalcTables(db);

// Perform calculations
const r1 = write.add(db, 10, 5);       // { result: 15, operator: '+', ... }
const r2 = write.multiply(db, r1.result, 2); // { result: 30, ... }

// Review history
const history = read.listHistory(db);   // [{ result: 30, ... }, { result: 15, ... }]
const last = read.getLastResult(db);    // { result: 30, ... }
```

## Write Surface

| Function                  | What it does                                      |
|---------------------------|---------------------------------------------------|
| `write.add(db, a, b)`     | Store `a + b`                                     |
| `write.subtract(db, a, b)`| Store `a - b`                                     |
| `write.multiply(db, a, b)`| Store `a * b`                                     |
| `write.divide(db, a, b)`  | Store `a / b` — throws `CalcValidationError` if `b === 0` |
| `write.clearHistory(db)`  | Delete all operations, return count deleted       |

All write functions accept an optional `now` timestamp as the last argument for
deterministic testing.

## Read Surface

| Function                        | What it returns                          |
|---------------------------------|------------------------------------------|
| `read.listHistory(db, options?)` | Operations ordered newest-first, up to `limit` (default 50) |
| `read.getLastResult(db)`        | The most recent operation, or `null`     |

## Error Handling

```ts
import { CalcValidationError, isCalcError } from '@ghostpaw/template';

try {
  write.divide(db, 10, 0);
} catch (error) {
  if (error instanceof CalcValidationError) {
    console.error('Division by zero:', error.message);
  }
}
```

## Human Operating Loop

1. Call `initCalcTables(db)` once at startup.
2. Use `write.*` to perform computations.
3. Use `read.listHistory` to audit or display results.
4. Use `read.getLastResult` to chain operations on previous output.
5. Use `write.clearHistory` for cleanup when the session is over.
