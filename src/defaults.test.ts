import { strictEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { DEFAULTS } from './defaults.ts';

describe('DEFAULTS', () => {
	it('has the correct apiRoot', () => {
		strictEqual(DEFAULTS.apiRoot, 'https://api.telegram.org');
	});

	it('has the correct parseMode', () => {
		strictEqual(DEFAULTS.parseMode, 'HTML');
	});

	it('has numeric timing knobs', () => {
		strictEqual(typeof DEFAULTS.pollingTimeout, 'number');
		strictEqual(typeof DEFAULTS.connectionTimeout, 'number');
		strictEqual(typeof DEFAULTS.typingInterval, 'number');
		strictEqual(typeof DEFAULTS.minEditInterval, 'number');
		strictEqual(typeof DEFAULTS.maxEditInterval, 'number');
	});

	it('minEditInterval is less than maxEditInterval', () => {
		strictEqual(DEFAULTS.minEditInterval < DEFAULTS.maxEditInterval, true);
	});

	it('has boolean flags', () => {
		strictEqual(typeof DEFAULTS.autoDownload, 'boolean');
		strictEqual(typeof DEFAULTS.chainOnOverflow, 'boolean');
		strictEqual(typeof DEFAULTS.statelessMode, 'boolean');
	});

	it('has empty array defaults for allow-lists', () => {
		strictEqual(Array.isArray(DEFAULTS.allowedChatIds), true);
		strictEqual(DEFAULTS.allowedChatIds.length, 0);
		strictEqual(Array.isArray(DEFAULTS.allowedUpdates), true);
		strictEqual(DEFAULTS.allowedUpdates.length, 0);
		strictEqual(Array.isArray(DEFAULTS.autoDownloadTypes), true);
	});

	it('has all 20 expected keys', () => {
		const keys = Object.keys(DEFAULTS);
		strictEqual(keys.length, 20);
	});
});
