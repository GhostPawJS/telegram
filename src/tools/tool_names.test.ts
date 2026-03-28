import { strictEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { calculateToolName, clearHistoryToolName, reviewHistoryToolName } from './tool_names.ts';

describe('tool names', () => {
	it('are stable string constants', () => {
		strictEqual(calculateToolName, 'calculate');
		strictEqual(reviewHistoryToolName, 'review_history');
		strictEqual(clearHistoryToolName, 'clear_history');
	});
});
