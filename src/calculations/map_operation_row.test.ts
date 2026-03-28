import { strictEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { mapOperationRow } from './map_operation_row.ts';

describe('mapOperationRow', () => {
	it('maps snake_case row fields to camelCase record fields', () => {
		const row = { id: 1, a: 3, b: 4, operator: '+' as const, result: 7, created_at: 1000 };
		const record = mapOperationRow(row);
		strictEqual(record.id, 1);
		strictEqual(record.a, 3);
		strictEqual(record.b, 4);
		strictEqual(record.operator, '+');
		strictEqual(record.result, 7);
		strictEqual(record.createdAt, 1000);
	});
});
