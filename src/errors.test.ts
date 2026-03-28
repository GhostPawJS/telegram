import { strictEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { CalcError, CalcNotFoundError, CalcValidationError, isCalcError } from './errors.ts';

describe('errors', () => {
	it('creates typed calc errors', () => {
		const error = new CalcNotFoundError('op 42 not found');
		strictEqual(error instanceof CalcError, true);
		strictEqual(error.code, 'not_found');
		strictEqual(error.name, 'CalcNotFoundError');
	});

	it('detects calc errors', () => {
		strictEqual(isCalcError(new CalcValidationError('bad input')), true);
		strictEqual(isCalcError(new Error('bad input')), false);
		strictEqual(isCalcError(null), false);
	});
});
