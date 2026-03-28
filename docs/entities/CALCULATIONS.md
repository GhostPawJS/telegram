# `calculations`

> This is a template entity manual for the calculator toy domain. Replace this
> file with a manual for your own entity. See
> [`../../TEMPLATE.md`](../../TEMPLATE.md) for a full replacement guide.

## What It Is

`calculations` is the canonical record of every arithmetic operation this
package has performed and stored.

An operation is one computation — two operands, one operator, one result — plus
a timestamp. Nothing more.

## Why It Exists

The package needs one entity that answers: what was computed, with what inputs,
in what order, and what did it produce?

## How To Use It

Use operations through the main write verbs:

1. `write.add(db, a, b)`
2. `write.subtract(db, a, b)`
3. `write.multiply(db, a, b)`
4. `write.divide(db, a, b)`

And the read surfaces:

1. `read.listHistory(db, options?)`
2. `read.getLastResult(db)`

To clear: `write.clearHistory(db)`.

## Good Uses

- Sequential step-by-step calculations where intermediates matter
- Audit logs for computations performed by an LLM agent
- Input to downstream systems that need a result trace

## Do Not Use It For

- Storing symbolic expressions or unevaluated formulas
- Complex scientific notation requiring arbitrary precision
- Matrix, vector, or statistical operations (add entity types for those)

## Operator Enum

- `+` addition
- `-` subtraction
- `*` multiplication
- `/` division

## Invariants

- `b` must not be zero when `operator` is `'/'`
- `a` and `b` must be finite numbers
- History is append-only — operations are never updated after insertion
- Results are IEEE 754 doubles

## Public APIs

### Writes

- `write.add(db, a, b, now?)`
- `write.subtract(db, a, b, now?)`
- `write.multiply(db, a, b, now?)`
- `write.divide(db, a, b, now?)`
- `write.clearHistory(db)`

### Reads

- `read.listHistory(db, options?)`
- `read.getLastResult(db)`
