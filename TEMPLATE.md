# Using This Template

This repository is a kickstart. The **calculator domain is toy content** — it exists to give you something concrete, working, and readable to copy from. Replace it with your domain.

## What To Keep (Structural Scaffold)

These files define the GhostPaw architecture. Keep their shape; update names to match your domain:

| Path | What it provides |
|------|-----------------|
| `src/tools/tool_types.ts` | `ToolResult` discriminated union — keep as-is |
| `src/tools/tool_metadata.ts` | JSON Schema builders — keep as-is |
| `src/tools/tool_registry.ts` | Tool registry pattern — keep as-is |
| `src/skills/skill_types.ts` | Skill definition helper — keep as-is |
| `src/skills/skill_registry.ts` | Skill registry pattern — keep as-is |
| `src/with_transaction.ts` | Nested savepoint helper — keep as-is |
| `src/resolve_now.ts` | Injectable clock for testable timestamps — keep as-is |
| `src/lib/` | Test helpers — rename types to your entity |
| `.github/workflows/disabled/` | CI/CD pipelines — move to `.github/workflows/` when ready |
| `tsconfig.json`, `biome.json`, `tsup.config.ts` | Tooling config — keep as-is |

## What To Replace (Calculator Content)

These files contain calculator-specific domain content. Replace the content; keep the structural shape.

### Core identity

| File | What to replace |
|------|----------------|
| `README.md` | Package name, description, quick-start examples |
| `CONCEPT.md` | Entire domain model, grammar, and invariants |
| `package.json` | `name`, `description`, `keywords` |

### Domain entity

| Path | What to replace |
|------|----------------|
| `src/calculations/` | Entire directory — replace with your entity folder(s) |
| `src/database.ts` | `CalcDb` type alias — rename to your domain |
| `src/errors.ts` | `CalcValidationError` — rename and adapt |
| `src/types.ts` | `OperationRecord` — replace with your entity types |
| `src/init_calc_tables.ts` | DDL — replace with your schema |
| `src/read.ts` | Query barrel — rewire to your entity reads |
| `src/write.ts` | Mutation barrel — rewire to your entity writes |

### LLM layer

| File | What to replace |
|------|----------------|
| `src/soul.ts` | Soul name, essence, and traits — describe your domain's posture |
| `src/tools/calculate_tool.ts` | Replace with your domain's write tools |
| `src/tools/review_history_tool.ts` | Replace with your domain's read tools |
| `src/tools/tool_names.ts` | Tool name constants — rename to your tools |
| `src/skills/compute-step-by-step.ts` | Replace with your domain's workflow skills |
| `src/skills/review-calculation-history.ts` | Replace with your domain's workflow skills |

### Documentation

| File | What to replace |
|------|----------------|
| `docs/HUMAN.md` | Rewrite for your entity's `read` / `write` API |
| `docs/LLM.md` | Rewrite for your `soul`, `tools`, and `skills` |
| `docs/README.md` | Update the architecture section with your entity names |
| `docs/entities/CALCULATIONS.md` | Replace with your entity manual(s) |

### Demo

| File | What to replace |
|------|----------------|
| `src/demo/main.tsx` | Replace with a demo for your domain |

## Replacement Checklist

1. [ ] Rename all occurrences of `template` / `Template` → your package name
2. [ ] Rename all occurrences of `calc` / `Calc` → your domain prefix
3. [ ] Replace `src/calculations/` with your entity folder(s)
4. [ ] Write a new soul in `src/soul.ts` — essence and traits for your domain
5. [ ] Write tools for your domain operations in `src/tools/`
6. [ ] Write skills for your domain workflows in `src/skills/`
7. [ ] Update `CONCEPT.md` with your domain model, grammar, and invariants
8. [ ] Update `docs/` — entity manual, `HUMAN.md`, and `LLM.md`
9. [ ] Fill in the `README.md` description and quick-start example
10. [ ] Move `.github/workflows/disabled/*.yml` → `.github/workflows/`
