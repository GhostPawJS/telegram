import { strictEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
	isTelegramError,
	TelegramApiError,
	TelegramError,
	TelegramFileError,
	TelegramNotFoundError,
	TelegramRateLimitError,
	TelegramStateError,
	TelegramTransportError,
	TelegramValidationError,
} from './errors.ts';

describe('TelegramError hierarchy', () => {
	it('TelegramNotFoundError has correct code and name', () => {
		const err = new TelegramNotFoundError('chat 42 not found');
		strictEqual(err instanceof TelegramError, true);
		strictEqual(err.code, 'TELEGRAM_NOT_FOUND');
		strictEqual(err.name, 'TelegramNotFoundError');
		strictEqual(err.message, 'chat 42 not found');
	});

	it('TelegramTransportError has correct code and name', () => {
		const err = new TelegramTransportError('polling failed');
		strictEqual(err.code, 'TELEGRAM_TRANSPORT');
		strictEqual(err.name, 'TelegramTransportError');
	});

	it('TelegramRateLimitError has correct code and name', () => {
		const err = new TelegramRateLimitError('too many requests');
		strictEqual(err.code, 'TELEGRAM_RATE_LIMIT');
		strictEqual(err.name, 'TelegramRateLimitError');
	});

	it('TelegramApiError has correct code and name', () => {
		const err = new TelegramApiError('Bad Request');
		strictEqual(err.code, 'TELEGRAM_API');
		strictEqual(err.name, 'TelegramApiError');
	});

	it('TelegramValidationError has correct code and name', () => {
		const err = new TelegramValidationError('invalid chat_id');
		strictEqual(err.code, 'TELEGRAM_VALIDATION');
		strictEqual(err.name, 'TelegramValidationError');
	});

	it('TelegramStateError has correct code and name', () => {
		const err = new TelegramStateError('bot not started');
		strictEqual(err.code, 'TELEGRAM_STATE');
		strictEqual(err.name, 'TelegramStateError');
	});

	it('TelegramFileError has correct code and name', () => {
		const err = new TelegramFileError('download failed');
		strictEqual(err.code, 'TELEGRAM_FILE');
		strictEqual(err.name, 'TelegramFileError');
	});

	it('forwards cause', () => {
		const cause = new Error('original');
		const err = new TelegramApiError('wrapped', cause);
		strictEqual(err.cause, cause);
	});
});

describe('isTelegramError', () => {
	it('returns true for any TelegramError subclass', () => {
		strictEqual(isTelegramError(new TelegramNotFoundError('x')), true);
		strictEqual(isTelegramError(new TelegramTransportError('x')), true);
		strictEqual(isTelegramError(new TelegramRateLimitError('x')), true);
		strictEqual(isTelegramError(new TelegramApiError('x')), true);
		strictEqual(isTelegramError(new TelegramValidationError('x')), true);
		strictEqual(isTelegramError(new TelegramStateError('x')), true);
		strictEqual(isTelegramError(new TelegramFileError('x')), true);
	});

	it('returns false for non-TelegramError values', () => {
		strictEqual(isTelegramError(new Error('plain')), false);
		strictEqual(isTelegramError(null), false);
		strictEqual(isTelegramError('string'), false);
		strictEqual(isTelegramError(42), false);
	});
});
