import { strictEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { initCalcTables, read, skills, soul, tools, write } from './index.ts';

describe('package root exports', () => {
	it('exposes the main namespaces', () => {
		strictEqual(typeof initCalcTables, 'function');
		strictEqual(typeof read.listHistory, 'function');
		strictEqual(typeof read.getLastResult, 'function');
		strictEqual(typeof write.add, 'function');
		strictEqual(typeof write.subtract, 'function');
		strictEqual(typeof write.multiply, 'function');
		strictEqual(typeof write.divide, 'function');
		strictEqual(typeof write.clearHistory, 'function');
		strictEqual(Array.isArray(tools.calcTools), true);
		strictEqual(typeof tools.getCalcToolByName, 'function');
		strictEqual(typeof skills.listCalcSkills, 'function');
		strictEqual(typeof skills.getCalcSkillByName, 'function');
		strictEqual(typeof soul.calcSoul, 'object');
		strictEqual(typeof soul.renderCalcSoulPromptFoundation, 'function');
	});

	it('does not leak namespaced members to the top level', () => {
		const pkg = { initCalcTables, read, skills, soul, tools, write } as Record<string, unknown>;
		strictEqual('calcSoul' in pkg, false);
		strictEqual('listHistory' in pkg, false);
		strictEqual('add' in pkg, false);
	});
});
