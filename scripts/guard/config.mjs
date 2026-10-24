import assert from 'node:assert/strict';
import { insertMessage } from '../../src/messages/insert_message.ts';

// Guard calls must stay offline even when the parent environment has a token.
delete process.env.TELEGRAM_BOT_TOKEN;
export const packageName = '@ghostpaw/telegram';
export const publicEntries = ['.', './mcp'];
export const binName = 'ghostpaw-telegram';
export const extraFiles = ['SKILL.md', 'skills/telegram/SKILL.md'];
export const entries = {
	full: `export * from './dist/index.js';`,
	tools: `import {tools} from './dist/index.js'; export const registry = tools.telegramTools;`,
	'read-write': `export {read, write} from './dist/index.js';`,
	mcp: `export * from './dist/mcp.js';`,
	cli: { entryPoints: ['dist/cli.js'] },
	'mcp-server': { entryPoints: ['dist/mcp-server.js'] },
};
export const search = { subcommand: 'search_messages', chatId: 1, query: 'jasmine' };
export const modernMeta = {
	'io.modelcontextprotocol/protocolVersion': '2026-07-28',
	'io.modelcontextprotocol/clientCapabilities': {},
};
export const discover = {
	jsonrpc: '2.0',
	id: 4,
	method: 'server/discover',
	params: { _meta: modernMeta },
};
export const searchRequest = {
	jsonrpc: '2.0',
	id: 5,
	method: 'tools/call',
	params: { name: 'tg_read', arguments: search, _meta: modernMeta },
};
export const legacyRequests = [
	{
		jsonrpc: '2.0',
		id: 1,
		method: 'initialize',
		params: {
			protocolVersion: '2025-11-25',
			capabilities: {},
			clientInfo: { name: 'guard', version: '1' },
		},
	},
	{ jsonrpc: '2.0', id: 2, method: 'tools/list' },
	{ jsonrpc: '2.0', id: 3, method: 'tools/call', params: { name: 'tg_read', arguments: search } },
];
// CLI writes are network plans. Mirror persistence is checked through the library storage API below.
export const cliRemember = [
	'call',
	'tg_send',
	JSON.stringify({ subcommand: 'send_message', chatId: 1, text: 'jasmine tea' }),
];
export const cliSearch = ['call', 'tg_read', JSON.stringify(search)];
export function seedClaim(i, random = () => 0.5) {
	return {
		chatId: 1,
		messageId: i + 1,
		direction: 'in',
		date: 1700000000 + i,
		fromDisplayName: 'Mira',
		type: 'text',
		text: `Project ${i} jasmine tea planning ${Math.floor(random() * 100)}`,
		textPlain: `Project ${i} jasmine tea planning`,
		mentions: [],
		raw: {},
	};
}
export function seed(db, i, random) {
	return insertMessage(db, seedClaim(i, random));
}
export function assertApi(root, mcp) {
	for (const key of ['initTelegramTables', 'read', 'write', 'tools']) assert.ok(root[key], key);
	assert.equal(typeof mcp.createTelegramMcpServer, 'function');
}
export function smokeLibrary(api, db) {
	api.initTelegramTables(db);
	const message = seed(db, 0);
	const tool = api.tools.getTelegramToolByName('tg_read');
	const result = tool.handler(db, search);
	assert.equal(result.ok, true);
	assert.ok(result.data.some((item) => item.messageId === message.messageId));
	const plan = api.tools
		.getTelegramToolByName('tg_send')
		.handler(db, { subcommand: 'send_message', chatId: 1, text: 'reply' });
	assert.equal(plan.data.action, 'send_message');
}
export const typeConsumer = `import {DatabaseSync} from 'node:sqlite';
import {initTelegramTables, read, tools} from '${packageName}';
import {createTelegramMcpServer} from '${packageName}/mcp';
const db = new DatabaseSync(':memory:'); initTelegramTables(db);
read.searchMessages(db, 1, 'tea'); tools.telegramTools[0]?.handler(db, {subcommand: 'list_chats'});
createTelegramMcpServer({db});`;
export function createServer(mcp, db) {
	return mcp.createTelegramMcpServer({ db });
}
export function hotPaths(api, db, server) {
	return {
		'mirror.insertMessage': (i) => seed(db, 10000 + i),
		'read.searchMessages': () => api.read.searchMessages(db, 1, 'jasmine'),
		tg_read: () => api.tools.getTelegramToolByName('tg_read').handler(db, search),
		tg_connect: () =>
			api.tools.getTelegramToolByName('tg_connect').handler(db, { subcommand: 'get_stats' }),
		'MCP tools/call': () => server.handleLine(JSON.stringify(searchRequest)),
	};
}
export function consumerSmoke(configUrl) {
	return `import {createRequire} from 'node:module'; import {DatabaseSync} from 'node:sqlite';
 import {assertApi,smokeLibrary} from ${JSON.stringify(configUrl)};
 const require = createRequire(import.meta.url);
 const root = await import('${packageName}'); const mcp = await import('${packageName}/mcp');
 assertApi(root,mcp); assertApi(require('${packageName}'),require('${packageName}/mcp'));
 const db = new DatabaseSync(':memory:'); try {smokeLibrary(root,db);} finally {db.close();}`;
}
export function assertRoundTrip(remembered, searched) {
	assert.equal(remembered.outcome, 'success');
	assert.equal(remembered.data.action, 'send_message');
	assert.equal(searched.outcome, 'no_op');
}
export function assertMcpReplies(replies) {
	assert.equal(replies[1].result.tools.length, 4);
	assert.equal(replies[2].result.structuredContent.outcome, 'no_op');
	assert.equal(replies[3].result.resultType, 'complete');
}
