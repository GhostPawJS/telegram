import { strictEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';

import { nextAskUser, nextInspectItem, nextRetryWith, nextUseTool } from './tool_next.ts';

describe('tool_next builders', () => {
	it('nextUseTool produces use_tool kind', () => {
		const hint = nextUseTool('tg_read', 'check messages');
		strictEqual(hint.kind, 'use_tool');
		strictEqual(hint.tool, 'tg_read');
		strictEqual(hint.message, 'check messages');
	});

	it('nextUseTool accepts suggestedInput', () => {
		const hint = nextUseTool('tg_read', 'check', { chatId: 1 });
		strictEqual(hint.suggestedInput?.chatId, 1);
	});

	it('nextAskUser produces ask_user kind', () => {
		const hint = nextAskUser('which chat?');
		strictEqual(hint.kind, 'ask_user');
		strictEqual(hint.message, 'which chat?');
	});

	it('nextRetryWith produces retry_with kind', () => {
		const hint = nextRetryWith('tg_send', 'retry with corrected input');
		strictEqual(hint.kind, 'retry_with');
	});

	it('nextInspectItem produces inspect_item kind', () => {
		const hint = nextInspectItem('inspect the message');
		strictEqual(hint.kind, 'inspect_item');
	});
});
