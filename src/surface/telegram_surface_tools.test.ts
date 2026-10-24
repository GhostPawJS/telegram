import assert from 'node:assert/strict';
import { test } from 'node:test';
import { validateInput } from '../surfaces/validate_input.ts';
import { telegramSurfaceTools } from './telegram_surface_tools.ts';

const inputs: Record<string, Record<string, unknown>> = {
	tg_read: { subcommand: 'search_messages', chatId: 1, query: 'tea' },
	tg_send: { subcommand: 'send_message', chatId: 1, text: 'Hello' },
	tg_manage: { subcommand: 'ban_user', chatId: 1, userId: 2 },
	tg_connect: { subcommand: 'get_stats' },
};
test('every Telegram schema accepts representative handler inputs and rejects invalid shapes', () => {
	for (const tool of telegramSurfaceTools) {
		assert.ok(inputs[tool.name], tool.name);
		assert.deepEqual(validateInput(tool.inputSchema, inputs[tool.name]), [], tool.name);
		assert.ok(validateInput(tool.inputSchema, []).length, tool.name);
		assert.ok(
			validateInput(tool.inputSchema, { ...inputs[tool.name], subcommand: 'invalid' }).length,
			tool.name,
		);
		assert.ok(
			validateInput(tool.inputSchema, { ...inputs[tool.name], subcommand: 42 }).length,
			tool.name,
		);
		for (const required of tool.inputSchema.required ?? []) {
			const input = { ...inputs[tool.name] };
			delete input[required];
			assert.ok(validateInput(tool.inputSchema, input).length, `${tool.name}.${required}`);
		}
	}
});

test('surface returns offline plans and executes with a token without leaking it', async (t) => {
	const { openTelegramDb } = await import('./open_telegram_db.ts');
	const token = `123:${'x'.repeat(35)}`;
	const previous = process.env.TELEGRAM_BOT_TOKEN;
	const db = await openTelegramDb(':memory:');
	try {
		delete process.env.TELEGRAM_BOT_TOKEN;
		const send = telegramSurfaceTools.find((tool) => tool.name === 'tg_send');
		assert.ok(send);
		const input = { subcommand: 'send_message', chatId: 1, text: 'Hello' };
		assert.deepEqual(
			await send.handler(db, input),
			JSON.parse(
				JSON.stringify(
					(await import('../tools/tool_registry.ts'))
						.getTelegramToolByName('tg_send')
						?.handler(db, input),
				),
			),
		);
		let calls = 0;
		t.mock.method(globalThis, 'fetch', async (url: string, init: RequestInit) => {
			calls++;
			assert.ok(url.includes(`/bot${token}/sendMessage`));
			assert.deepEqual(JSON.parse(init.body as string), { chat_id: 1, text: 'Hello' });
			return new Response(
				JSON.stringify({ ok: true, result: { message_id: 7, chat: { id: 1 }, date: 1 } }),
			);
		});
		process.env.TELEGRAM_BOT_TOKEN = token;
		const executed = await send.handler(db, input);
		assert.equal(calls, 1);
		assert.match(JSON.stringify(executed), /Executed send_message/);
		assert.ok(!JSON.stringify(executed).includes(token));
		t.mock.method(globalThis, 'fetch', async () => {
			throw new Error(`Failed ${token}`);
		});
		const failed = await send.handler(db, input);
		assert.ok(!JSON.stringify(failed).includes(token));
		assert.equal((failed as { ok: boolean }).ok, false);
	} finally {
		if (previous === undefined) delete process.env.TELEGRAM_BOT_TOKEN;
		else process.env.TELEGRAM_BOT_TOKEN = previous;
		db.close();
	}
});
