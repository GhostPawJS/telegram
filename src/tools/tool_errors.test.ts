import { strictEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { TelegramApiError, TelegramNotFoundError, TelegramValidationError } from '../errors.ts';
import { translateToolError, withToolHandling } from './tool_errors.ts';

describe('translateToolError', () => {
	it('maps TelegramValidationError to domain kind', () => {
		const result = translateToolError(new TelegramValidationError('bad input'));
		strictEqual(result.ok, false);
		strictEqual(result.outcome, 'error');
		strictEqual(result.error.kind, 'domain');
	});

	it('maps TelegramNotFoundError to domain kind', () => {
		const result = translateToolError(new TelegramNotFoundError('not found'));
		strictEqual(result.error.kind, 'domain');
	});

	it('maps TelegramApiError to protocol kind', () => {
		const result = translateToolError(new TelegramApiError('bad request'));
		strictEqual(result.error.kind, 'protocol');
	});

	it('maps plain Error to system kind', () => {
		const result = translateToolError(new Error('unexpected'));
		strictEqual(result.error.kind, 'system');
		strictEqual(result.error.message, 'unexpected');
	});

	it('maps non-Error thrown value to system kind', () => {
		const result = translateToolError('some string');
		strictEqual(result.error.kind, 'system');
	});
});

describe('withToolHandling', () => {
	it('returns the result of a successful fn', () => {
		const result = withToolHandling(
			() => ({ ok: true, outcome: 'success', summary: 'ok', data: 42 }) as const,
		);
		strictEqual(result.ok, true);
	});

	it('catches thrown errors and returns ToolFailure', () => {
		const result = withToolHandling(() => {
			throw new TelegramApiError('boom');
		});
		strictEqual(result.ok, false);
		strictEqual(result.outcome, 'error');
	});
});
