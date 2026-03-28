export type CalcErrorCode = 'not_found' | 'state' | 'validation';

export class CalcError extends Error {
	readonly code: CalcErrorCode;

	constructor(code: CalcErrorCode, message: string) {
		super(message);
		this.name = 'CalcError';
		this.code = code;
	}
}

export class CalcNotFoundError extends CalcError {
	constructor(message: string) {
		super('not_found', message);
		this.name = 'CalcNotFoundError';
	}
}

export class CalcStateError extends CalcError {
	constructor(message: string) {
		super('state', message);
		this.name = 'CalcStateError';
	}
}

export class CalcValidationError extends CalcError {
	constructor(message: string) {
		super('validation', message);
		this.name = 'CalcValidationError';
	}
}

export function isCalcError(value: unknown): value is CalcError {
	return value instanceof CalcError;
}
