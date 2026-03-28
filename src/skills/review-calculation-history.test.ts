import { strictEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { reviewCalculationHistorySkill } from './review-calculation-history.ts';

describe('reviewCalculationHistorySkill', () => {
	it('has the expected name and references review_history', () => {
		strictEqual(reviewCalculationHistorySkill.name, 'review-calculation-history');
		strictEqual(reviewCalculationHistorySkill.content.includes('review_history'), true);
	});
});
