import { strictEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { toolFailure, toolNoOp, toolSuccess, toolWarning } from './tool_types.ts';

describe('tool result constructors', () => {
	it('toolSuccess sets ok=true and outcome=success', () => {
		const result = toolSuccess('done', { value: 42 });
		strictEqual(result.ok, true);
		strictEqual(result.outcome, 'success');
		strictEqual(result.data.value, 42);
	});

	it('toolNoOp sets outcome=no_op', () => {
		const result = toolNoOp('nothing changed', {});
		strictEqual(result.outcome, 'no_op');
	});

	it('toolFailure sets ok=false and outcome=error', () => {
		const result = toolFailure('domain', 'invalid_input', 'bad', 'reason');
		strictEqual(result.ok, false);
		strictEqual(result.outcome, 'error');
		strictEqual(result.error.code, 'invalid_input');
	});

	it('attaches warnings when provided', () => {
		const result = toolSuccess('ok', {}, { warnings: [toolWarning('empty_result', 'nothing')] });
		strictEqual(result.warnings?.length, 1);
	});
});
