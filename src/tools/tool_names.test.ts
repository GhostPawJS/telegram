import { strictEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
	tgConnectToolName,
	tgManageToolName,
	tgReadToolName,
	tgSendToolName,
} from './tool_names.ts';

describe('tool names', () => {
	it('are stable string constants', () => {
		strictEqual(tgReadToolName, 'tg_read');
		strictEqual(tgSendToolName, 'tg_send');
		strictEqual(tgManageToolName, 'tg_manage');
		strictEqual(tgConnectToolName, 'tg_connect');
	});
});
