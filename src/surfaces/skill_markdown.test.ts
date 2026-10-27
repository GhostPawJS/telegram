import assert from 'node:assert/strict';
import { test } from 'node:test';
import { renderSkillMarkdown, type SkillMarkdownSpec } from './skill_markdown.ts';

const spec: SkillMarkdownSpec<null> = {
	name: 'example',
	description: 'Manage records. Use when maintaining records.',
	bin: 'example',
	server: 'example',
	about: 'A record engine.',
	tools: [
		{
			name: 'find',
			description: 'Find records',
			whenToUse: 'searching',
			whenNotToUse: 'writing',
			readOnly: true,
			inputSchema: {
				type: 'object',
				required: ['mode'],
				properties: { mode: { type: 'string', enum: ['a', 'b'] } },
			},
			handler: () => null,
		},
	],
	workflows: [{ name: 'search', description: 'Search well' }],
	principles: ['Search first.'],
};
test('skill output has deterministic frontmatter, CLI, MCP and references', () => {
	const result = renderSkillMarkdown({ ...spec, metadata: { version: '1' }, license: 'MIT' });
	assert.equal(
		result,
		renderSkillMarkdown({ ...spec, metadata: { version: '1' }, license: 'MIT' }),
	);
	assert.ok(result.startsWith('---\nname: example\ndescription: '));
	for (const expected of [
		'MCP:',
		'example call <tool>',
		'references/search.md',
		'Read-only.',
		'| mode | string | yes | a, b.',
		'Search first.',
	])
		assert.ok(result.includes(expected), expected);
});
test('reject invalid skill metadata', () => {
	for (const name of ['UPPER', '-bad', 'a--b', 'a'.repeat(65)])
		assert.throws(() => renderSkillMarkdown({ ...spec, name }));
	for (const description of ['', 'x'.repeat(1025), 'Missing usage'])
		assert.throws(() => renderSkillMarkdown({ ...spec, description }));
});

test('reference base changes only workflow link targets', () => {
	assert.equal(
		renderSkillMarkdown(spec, { referencesBase: 'skills/example/references' }),
		renderSkillMarkdown(spec).replace(
			'(references/search.md)',
			'(skills/example/references/search.md)',
		),
	);
});

test('nested object and oneOf parameter fields are inlined with local required flags', () => {
	const tool = spec.tools[0];
	assert.ok(tool);
	const markdown = renderSkillMarkdown({
		...spec,
		tools: [
			{
				...tool,
				inputSchema: {
					type: 'object',
					required: ['record'],
					properties: {
						record: {
							type: 'object',
							required: ['title'],
							properties: {
								title: { type: 'string', description: 'Record title' },
								enabled: { type: 'boolean' },
							},
						},
						choice: {
							oneOf: [
								{ type: 'object', required: ['id'], properties: { id: { type: 'integer' } } },
								{ type: 'object', properties: { label: { type: 'string' } } },
							],
						},
					},
				},
			},
		],
	});
	for (const row of [
		'| record.title | string | yes | Record title |',
		'| record.enabled | boolean | no |',
		'| choice.id | integer | yes |',
		'| choice.label | string | no |',
	])
		assert.ok(markdown.includes(row), row);
});
