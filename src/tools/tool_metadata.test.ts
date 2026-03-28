import { deepStrictEqual, strictEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { enumSchema, numberSchema, objectSchema, stringSchema } from './tool_metadata.ts';

describe('schema builders', () => {
	it('stringSchema', () => {
		deepStrictEqual(stringSchema('a label'), { type: 'string', description: 'a label' });
	});

	it('numberSchema', () => {
		deepStrictEqual(numberSchema('a number'), { type: 'number', description: 'a number' });
	});

	it('enumSchema', () => {
		const schema = enumSchema(['+', '-'], 'operator');
		strictEqual(schema.type, 'string');
		deepStrictEqual(schema.enum, ['+', '-']);
	});

	it('objectSchema marks required fields', () => {
		const schema = objectSchema({ a: numberSchema('a'), b: numberSchema('b') }, ['a', 'b']);
		deepStrictEqual(schema.required, ['a', 'b']);
	});
});
