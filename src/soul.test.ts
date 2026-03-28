import { strictEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { calcSoul, renderCalcSoulPromptFoundation } from './soul.ts';

describe('calcSoul', () => {
	it('has the expected slug and name', () => {
		strictEqual(calcSoul.slug, 'precise-accountant');
		strictEqual(calcSoul.name, 'Precise Accountant');
	});

	it('has at least one trait', () => {
		strictEqual(calcSoul.traits.length > 0, true);
	});
});

describe('renderCalcSoulPromptFoundation', () => {
	it('includes the soul name, essence, and traits in the output', () => {
		const prompt = renderCalcSoulPromptFoundation();
		strictEqual(prompt.includes('Precise Accountant'), true);
		strictEqual(prompt.includes('Essence:'), true);
		strictEqual(prompt.includes('Traits:'), true);
	});
});
