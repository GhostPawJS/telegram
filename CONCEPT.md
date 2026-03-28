# @ghostpaw/template

> Replace this document with the domain model and vocabulary for your package.
> The sections below show the expected shape. The calculator example gives you
> something concrete to copy from.

This package is a standalone calculator engine for Node.js, built on SQLite.

It stores arithmetic operations with full operand, operator, result, and
timestamp metadata. It is designed for two audiences: human developers using
`read` and `write` directly, and LLM agents operating through the structured
`soul` / `tools` / `skills` runtime.

## The Operation Atom

An operation is one arithmetic computation plus the minimum metadata needed to
audit and replay it.

| Field       | Type      | Meaning                              |
|-------------|-----------|--------------------------------------|
| `id`        | integer   | Stable unique identifier             |
| `a`         | real      | Left-hand operand                    |
| `b`         | real      | Right-hand operand                   |
| `operator`  | enum      | `+`, `-`, `*`, or `/`               |
| `result`    | real      | The computed value                   |
| `createdAt` | timestamp | When the operation was performed     |

One operation carries one arithmetic expression. Multi-step calculations are
decomposed into a sequence of single-operator calls so each intermediate result
is traceable in history.

## Grammar

| Term          | Meaning                                                      |
|---------------|--------------------------------------------------------------|
| `Operation`   | A single arithmetic expression stored with its result        |
| `History`     | The append-only log of all operations, newest-first          |
| `Operand`     | A numeric input (`a` or `b`)                                 |
| `Operator`    | The arithmetic function applied to the operands              |
| `Trace`       | The ordered sequence of operations in a multi-step execution |

## Invariants

- History is append-only. Operations are never modified after insertion.
- Division by zero is rejected at write time with a `CalcValidationError`.
- Every operand must be a finite number; `Infinity` and `NaN` are rejected.
- Results are stored as IEEE 754 doubles — precision limits apply.

## Composability

This package is self-contained. It brings its own SQLite schema and requires
only a `DatabaseSync` instance from Node.js. It does not depend on any other
GhostPaw package.

In a larger system, it could sit alongside:

- A belief engine (e.g. `@ghostpaw/codex`) to record facts derived from results
- A task tracker (e.g. `@ghostpaw/questlog`) for computational goals
