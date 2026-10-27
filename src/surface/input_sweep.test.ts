import assert from 'node:assert/strict';
import { Writable } from 'node:stream';
import { test } from 'node:test';
import { initTelegramTables } from '../init_telegram_tables.ts';
import { openTestDatabase } from '../lib/open-test-database.ts';
import { runToolCli } from '../surfaces/cli.ts';
import { createMcpServer } from '../surfaces/mcp_server.ts';
import { createTelegramToolFacade } from '../tools/execution.ts';
import { telegramTools } from '../tools/tool_registry.ts';
import { telegramCliOptions } from './telegram_cli_options.ts';
import { telegramSurfaceTools } from './telegram_surface_tools.ts';

test('partial input sweep: every tool and action through CLI, MCP and exported facade', async () => {
	const db = await openTestDatabase();
	initTelegramTables(db);
	const facade = createTelegramToolFacade({
		client: {
			api: {},
			token: 'test',
			call: async () => {
				throw new Error('unexpected execution');
			},
		},
	});
	const server = createMcpServer({
		name: 'test',
		version: '1',
		tools: telegramSurfaceTools,
		context: () => db,
	});
	const inspect = (result: unknown) => {
		const text = JSON.stringify(result);
		assert.doesNotMatch(text, /system_error|internal error|Cannot read properties/i);
		if (/invalid_input|: required|: expected/.test(text))
			assert.match(text, /pass |recovery|retry_with/);
	};
	try {
		for (const tool of telegramTools) {
			const cases: Record<string, unknown>[] = [{}];
			for (const action of tool.inputSchema.properties?.subcommand?.enum ?? []) {
				const base = { subcommand: action };
				cases.push(base);
				for (const [key, schema] of Object.entries(tool.inputSchema.properties ?? {})) {
					if (schema.type === 'object' || schema.oneOf?.some((branch) => branch.type === 'object'))
						cases.push({ ...base, [key]: {} });
				}
			}
			for (const input of cases) {
				inspect(await facade.handler(db, tool.name, input));
				inspect(
					await telegramSurfaceTools.find((entry) => entry.name === tool.name)?.handler(db, input),
				);
				inspect(
					JSON.parse(
						(await server.handleLine(
							JSON.stringify({
								jsonrpc: '2.0',
								id: 1,
								method: 'tools/call',
								params: {
									_meta: {
										'io.modelcontextprotocol/protocolVersion': '2026-07-28',
										'io.modelcontextprotocol/clientCapabilities': {},
									},
									name: tool.name,
									arguments: input,
								},
							}),
						)) ?? 'null',
					),
				);
				let output = '';
				const sink = new Writable({
					write(chunk, _encoding, cb) {
						output += String(chunk);
						cb();
					},
				});
				await runToolCli(['call', tool.name, JSON.stringify(input)], {
					...telegramCliOptions,
					tools: telegramSurfaceTools,
					openContext: () => db,
					closeContext: () => {},
					stdout: sink,
					stderr: sink,
				});
				inspect(output);
			}
		}
	} finally {
		db.close();
	}
});
