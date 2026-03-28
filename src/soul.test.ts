import { strictEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { renderTelegramSoulPromptFoundation, telegramSoul } from './soul.ts';

describe('telegramSoul', () => {
	it('has the expected slug and name', () => {
		strictEqual(telegramSoul.slug, 'herald');
		strictEqual(telegramSoul.name, 'Herald');
	});

	it('has at least 5 traits', () => {
		strictEqual(telegramSoul.traits.length >= 5, true);
	});

	it('every trait has principle and provenance', () => {
		for (const trait of telegramSoul.traits) {
			strictEqual(typeof trait.principle, 'string');
			strictEqual(typeof trait.provenance, 'string');
			strictEqual(trait.principle.length > 0, true);
			strictEqual(trait.provenance.length > 0, true);
		}
	});
});

describe('renderTelegramSoulPromptFoundation', () => {
	it('includes the soul name, essence, and traits in the output', () => {
		const prompt = renderTelegramSoulPromptFoundation();
		strictEqual(prompt.includes('Herald'), true);
		strictEqual(prompt.includes('Essence:'), true);
		strictEqual(prompt.includes('Traits:'), true);
	});

	it('accepts a custom soul', () => {
		const custom = {
			slug: 'test',
			name: 'Test Soul',
			description: 'desc',
			essence: 'essence text',
			traits: [{ principle: 'p1', provenance: 'prov1' }],
		};
		const prompt = renderTelegramSoulPromptFoundation(custom);
		strictEqual(prompt.includes('Test Soul'), true);
		strictEqual(prompt.includes('p1'), true);
	});
});
