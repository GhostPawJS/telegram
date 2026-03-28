import { CalcValidationError } from '../errors.ts';

export function assertFiniteNumber(value: unknown, label: string): void {
	if (typeof value !== 'number' || !Number.isFinite(value)) {
		throw new CalcValidationError(`${label} must be a finite number, got: ${String(value)}`);
	}
}

export function assertNotZero(value: number, label: string): void {
	if (value === 0) {
		throw new CalcValidationError(`${label} must not be zero`);
	}
}
