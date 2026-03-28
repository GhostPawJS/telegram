// TEMPLATE: This is a calculator-specific workflow skill.
// Replace the name, description, and content with a skill for your own domain.
// Keep the defineCalcSkill call shape, renaming the prefix to match your package.

import { defineCalcSkill } from './skill_types.ts';

export const computeStepByStepSkill = defineCalcSkill({
	name: 'compute-step-by-step',
	description:
		'Break a multi-step calculation into atomic operations, performing and recording each step in sequence.',
	content: `# Compute Step by Step

Primary tools:
- \`calculate\`
- \`review_history\`

Goal:
- Execute a multi-step expression by decomposing it into sequential single-operator calls, storing each intermediate result.

When to use:
- The user asks for a calculation that requires more than one arithmetic operation.
- The intermediate results are meaningful and should be traceable in history.

When not to use:
- A single-operation calculation: just call \`calculate\` directly.
- When the user only wants the final answer without caring about intermediates.

Step-by-step sequence:
1. Parse the full expression into an ordered list of atomic operations.
2. Identify the correct order of operations (multiplication and division before addition and subtraction).
3. For each operation in order: call \`calculate\` with the correct operands and operator.
4. Use the \`result\` field from each response as the input to the next step.
5. After all steps complete, call \`review_history\` to confirm the full trace.
6. Return the final result and the count of steps performed.

Validation checks:
- Each intermediate result appears in history.
- The final result matches manual verification of the expression.
- No division-by-zero error was silently ignored.

Pitfalls:
- Do not batch multiple operations into a single \`calculate\` call — one call per step.
- Do not skip \`review_history\` at the end; it confirms the trace is intact.
- Always handle \`outcome: "error"\` from \`calculate\` before proceeding to the next step.

Related skills:
- \`review-calculation-history\``,
});
