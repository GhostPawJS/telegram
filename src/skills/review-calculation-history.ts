// TEMPLATE: This is a calculator-specific workflow skill.
// Replace the name, description, and content with a skill for your own domain.
// Keep the defineCalcSkill call shape, renaming the prefix to match your package.

import { defineCalcSkill } from './skill_types.ts';

export const reviewCalculationHistorySkill = defineCalcSkill({
	name: 'review-calculation-history',
	description:
		'Review, summarize, and reason about the calculation history — identify patterns, spot errors, and surface useful observations.',
	content: `# Review Calculation History

Primary tools:
- \`review_history\`

Goal:
- Give the operator a clear picture of what has been computed, any anomalies, and what to do next.

When to use:
- The user asks to see recent calculations.
- You need to verify that a prior \`compute-step-by-step\` run produced the expected trace.
- The user asks whether any calculations seem unusual or wrong.

When not to use:
- When the user just wants a single new calculation — use \`calculate\` directly.

Step-by-step sequence:
1. Call \`review_history\` with an appropriate limit (default 50, increase if the user asks for more).
2. Scan the returned operations for:
   - Division-by-zero attempts (should never appear — these are blocked at write time).
   - Unexpectedly large or small results that may indicate an input error.
   - Repeated identical operations that may be duplicates.
3. Summarise the history: total count, operators used, result range.
4. If anomalies were found, describe them clearly and suggest follow-up actions.
5. If the history is empty, inform the operator and suggest using \`calculate\`.

Validation checks:
- The count returned matches the visible list length.
- Results are arithmetically consistent with their recorded operands and operator.

Pitfalls:
- Do not assume the history is complete if a small limit was used — increase it if needed.
- Do not modify history during this skill; it is read-only.

Related skills:
- \`compute-step-by-step\``,
});
