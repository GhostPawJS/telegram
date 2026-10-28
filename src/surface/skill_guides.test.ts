import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { Writable } from 'node:stream';
import { test } from 'node:test';
import { telegramSkills } from '../skills/skill_registry.ts';
import { runToolCli } from '../surfaces/cli.ts';
import { renderSkillMarkdown } from '../surfaces/skill_markdown.ts';
import { validateInput } from '../surfaces/validate_input.ts';
import { telegramCliOptions } from './telegram_cli_options.ts';
import { telegramSkillSpec } from './telegram_skill_spec.ts';

test('skill CLI lists, renders embedded guides byte-identically and reports usage errors', async () => {
	const invoke = async (args: string[]) => {
		let out = '';
		let err = '';
		const capture = (append: (text: string) => void) =>
			new Writable({
				write(chunk, _encoding, cb) {
					append(String(chunk));
					cb();
				},
			});
		const code = await runToolCli(['skill', ...args], {
			...telegramCliOptions,
			stdout: capture((text) => {
				out += text;
			}),
			stderr: capture((text) => {
				err += text;
			}),
		});
		return { code, out, err };
	};
	for (const guide of telegramSkills) {
		assert.equal(
			(await invoke([guide.name])).out,
			readFileSync(`skills/telegram/references/${guide.name}.md`, 'utf8'),
		);
		assert.ok((await invoke(['--list'])).out.includes(`${guide.name}  `));
	}
	assert.match((await invoke(['--help'])).out, /skill <guide>/);
	assert.match((await invoke(['--help'])).out, /--short/);
	const full = (await invoke([])).out;
	assert.ok(!full.includes('references/'));
	assert.ok(!/\|\s*\|$/m.test(full));
	for (const guide of telegramSkills)
		assert.ok(full.includes(`ghostpaw-telegram skill ${guide.name}`));
	const short = await invoke(['--short']);
	assert.equal(short.code, 0);
	assert.ok(short.out.trim().split('\n').length < 45);
	assert.ok(short.out.trim().split('\n').length >= 30);
	for (const command of [
		'--version',
		'tools',
		'describe',
		'call',
		'mcp',
		'skill --list',
		'skill --short',
	])
		assert.ok(short.out.includes(command));
	assert.deepEqual(await invoke(['missing']), {
		code: 1,
		out: '',
		err: 'unknown guide missing; run ghostpaw-telegram skill --list\n',
	});
});

test('every generated skill call example validates against its tool input schema', () => {
	const markdown = renderSkillMarkdown(telegramSkillSpec);
	const examples = [...markdown.matchAll(/`ghostpaw-telegram call (\w+) '([^'\n]+)'`/g)];
	assert.equal(examples.length, telegramSkillSpec.tools.length * 3);
	for (const [, name, json] of examples) {
		const tool = telegramSkillSpec.tools.find((tool) => tool.name === name);
		assert.ok(tool);
		assert.deepEqual(validateInput(tool.inputSchema, JSON.parse(json ?? '')), []);
	}
	assert.doesNotMatch(markdown.split('## Without the binary')[0] ?? '', /npx|npm|Node.js 24/);
});
