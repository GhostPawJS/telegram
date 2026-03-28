import { throws } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { CalcValidationError } from '../errors.ts';

import { assertFiniteNumber, assertNotZero } from './validators.ts';

describe('assertFiniteNumber', () => {
	it('passes for finite numbers', () => {
		assertFiniteNumber(0, 'x');
		assertFiniteNumber(-1.5, 'x');
		assertFiniteNumber(1e6, 'x');
	});

	it('throws for non-finite values', () => {
		throws(() => assertFiniteNumber(Infinity, 'x'), CalcValidationError);
		throws(() => assertFiniteNumber(NaN, 'x'), CalcValidationError);
		throws(() => assertFiniteNumber('3', 'x'), CalcValidationError);
	});
});

describe('assertNotZero', () => {
	it('passes for non-zero values', () => {
		assertNotZero(1, 'b');
		assertNotZero(-0.001, 'b');
	});

	it('throws for zero', () => {
		throws(() => assertNotZero(0, 'b'), CalcValidationError);
	});
});
