import assert from 'node:assert/strict';
import { test } from 'node:test';
import { parameterRows } from './parameter_rows.ts';

test('parameter rows describe parents, array items, and every optional nested field', () => {
	const rows = parameterRows({
		properties: {
			quest: {
				type: 'object',
				required: ['title'],
				properties: {
					title: { type: 'string', description: 'Quest title' },
					...Object.fromEntries(
						Array.from({ length: 10 }, (_, index) => [`field${index}`, { type: 'boolean' }]),
					),
				},
			},
			records: {
				type: 'array',
				items: {
					type: 'object',
					required: ['id'],
					properties: { id: { type: 'integer', description: 'Record identifier' } },
				},
			},
		},
	});
	assert.ok(rows.some((row) => row.includes('Object: title (required)')));
	assert.ok(rows.includes('| quest.title | string | yes | Quest title |'));
	assert.ok(rows.some((row) => row.includes('quest.field9')));
	assert.ok(rows.includes('| records[].id | integer | yes | Record identifier |'));
	assert.ok(rows.every((row) => !/\|\s*\|$/.test(row)));
});
