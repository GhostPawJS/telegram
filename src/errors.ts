export type TelegramErrorCode =
	| 'TELEGRAM_NOT_FOUND'
	| 'TELEGRAM_TRANSPORT'
	| 'TELEGRAM_RATE_LIMIT'
	| 'TELEGRAM_API'
	| 'TELEGRAM_VALIDATION'
	| 'TELEGRAM_STATE'
	| 'TELEGRAM_FILE';

export class TelegramError extends Error {
	readonly code: TelegramErrorCode;
	readonly cause: unknown;

	constructor(code: TelegramErrorCode, message: string, cause?: unknown) {
		super(message);
		this.name = 'TelegramError';
		this.code = code;
		this.cause = cause;
	}
}

export class TelegramNotFoundError extends TelegramError {
	constructor(message: string, cause?: unknown) {
		super('TELEGRAM_NOT_FOUND', message, cause);
		this.name = 'TelegramNotFoundError';
	}
}

export class TelegramTransportError extends TelegramError {
	constructor(message: string, cause?: unknown) {
		super('TELEGRAM_TRANSPORT', message, cause);
		this.name = 'TelegramTransportError';
	}
}

export class TelegramRateLimitError extends TelegramError {
	constructor(message: string, cause?: unknown) {
		super('TELEGRAM_RATE_LIMIT', message, cause);
		this.name = 'TelegramRateLimitError';
	}
}

export class TelegramApiError extends TelegramError {
	constructor(message: string, cause?: unknown) {
		super('TELEGRAM_API', message, cause);
		this.name = 'TelegramApiError';
	}
}

export class TelegramValidationError extends TelegramError {
	constructor(message: string, cause?: unknown) {
		super('TELEGRAM_VALIDATION', message, cause);
		this.name = 'TelegramValidationError';
	}
}

export class TelegramStateError extends TelegramError {
	constructor(message: string, cause?: unknown) {
		super('TELEGRAM_STATE', message, cause);
		this.name = 'TelegramStateError';
	}
}

export class TelegramFileError extends TelegramError {
	constructor(message: string, cause?: unknown) {
		super('TELEGRAM_FILE', message, cause);
		this.name = 'TelegramFileError';
	}
}

export function isTelegramError(value: unknown): value is TelegramError {
	return value instanceof TelegramError;
}
