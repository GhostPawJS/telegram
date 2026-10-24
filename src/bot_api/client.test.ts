import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { it } from 'node:test';
import { Bot } from 'grammy';
import { adaptBot } from '../lib/adapt_bot.ts';
import { createApiClient, TelegramApiError } from './client.ts';
import { containsInputFile, InputFile } from './input_file.ts';

const success = (result: unknown) => Response.json({ ok: true, result });
it('posts every used Bot API method as JSON, preserving values and API roots', async () => {
	const methods = [
		'sendMessage',
		'editMessageText',
		'deleteMessage',
		'sendPhoto',
		'sendDocument',
		'sendVideo',
		'sendVoice',
		'sendAudio',
		'forwardMessage',
		'pinChatMessage',
		'unpinChatMessage',
		'sendChatAction',
		'setMessageReaction',
		'answerCallbackQuery',
		'getFile',
		'getMe',
		'getUpdates',
		'setWebhook',
		'deleteWebhook',
		'setMyCommands',
		'banChatMember',
		'unbanChatMember',
		'restrictChatMember',
		'promoteChatMember',
	];
	const calls: string[] = [];
	const client = createApiClient('123:fake', {
		apiRoot: 'https://local.test/',
		fetch: async (url, init) => {
			const method = String(url).split('/').at(-1) ?? '';
			assert.equal(String(url), `https://local.test/bot123:fake/${method}`);
			assert.equal(init?.method, 'POST');
			assert.deepEqual(init?.headers, { 'content-type': 'application/json' });
			assert.deepEqual(JSON.parse(String(init?.body)), {
				chat_id: 1,
				text: 'hello',
				options: { enabled: false },
			});
			calls.push(method);
			return success({ method });
		},
	});
	for (const method of methods)
		assert.deepEqual(
			await client.call(method, { chat_id: 1, text: 'hello', options: { enabled: false } }),
			{ method },
		);
	assert.deepEqual(calls, methods);
	const api = client.api.sendMessage;
	assert.ok(api);
	await api({ chat_id: 1, text: 'hello', options: { enabled: false } });
});
it('serializes nested uploads and URL sources into multipart attachments', async () => {
	let downloads = 0;
	const client = createApiClient('token', {
		fetch: async (url, init) => {
			if (String(url) === 'https://files.test/file') {
				downloads++;
				return new Response('remote');
			}
			assert.ok(init?.body instanceof FormData);
			const form = init.body;
			assert.equal(form.get('chat_id'), '1');
			assert.equal(form.get('caption'), 'caption');
			assert.equal(form.get('missing'), null);
			const files = [...form.values()].filter((v): v is File => v instanceof Blob);
			assert.deepEqual(await Promise.all(files.map((f) => f.text())), ['local', 'remote']);
			assert.equal(files[0]?.name, 'local.txt');
			assert.equal(files[1]?.name, 'file');
			assert.deepEqual(JSON.parse(String(form.get('media'))), [
				{ media: 'attach://file0', type: 'photo' },
				{ media: 'attach://file1', type: 'document' },
			]);
			return success(true);
		},
	});
	assert.equal(
		await client.call('sendMediaGroup', {
			chat_id: 1,
			caption: 'caption',
			missing: undefined,
			media: [
				{ media: new InputFile(Buffer.from('local'), 'local.txt'), type: 'photo' },
				{ media: new InputFile({ url: 'https://files.test/file' }), type: 'document' },
			],
		}),
		true,
	);
	assert.equal(downloads, 1);
	assert.equal(containsInputFile(null), false);
	assert.equal(containsInputFile(['id']), false);
});
it('reads local paths and maps failed URL downloads', async () => {
	const file = new InputFile('package.json');
	assert.equal(await (await file.toBlob(fetch)).text(), await readFile('package.json', 'utf8'));
	await assert.rejects(
		new InputFile({ url: 'https://files.test/missing' }).toBlob(
			async () => new Response('', { status: 404 }),
		),
		/HTTP 404/,
	);
});
it('maps Telegram errors including retry_after and masks tokens in all error messages', async () => {
	const client = createApiClient('secret', {
		fetch: async () =>
			Response.json({
				ok: false,
				error_code: 429,
				description: 'secret wait',
				parameters: { retry_after: 3 },
			}),
	});
	await assert.rejects(client.call('sendMessage'), (error: unknown) => {
		assert.ok(error instanceof TelegramApiError);
		assert.equal(error.error_code, 429);
		assert.deepEqual(error.parameters, { retry_after: 3 });
		assert.equal(error.description, '[REDACTED] wait');
		assert.ok(!String(error).includes('secret'));
		return true;
	});
	for (const error of [new Error('https://api.telegram.org/botsecret/sendMessage'), 'secret']) {
		await assert.rejects(
			createApiClient('secret', {
				fetch: async () => {
					throw error;
				},
			}).call('sendMessage'),
			/REDACTED/,
		);
	}
	await assert.rejects(
		createApiClient('secret', {
			fetch: async () => Response.json({ ok: false }, { status: 500, statusText: 'failure' }),
		}).call('getMe'),
		/500: failure/,
	);
});
it('adapts a real grammy Bot: raw calls retain transformers and uploads use injected fetch', async () => {
	const bot = new Bot('123:fake', {
		botInfo: {
			id: 1,
			is_bot: true,
			first_name: 'test',
			username: 'test',
			can_join_groups: true,
			can_read_all_group_messages: false,
			supports_inline_queries: false,
			can_connect_to_business: false,
			has_main_web_app: false,
			has_topics_enabled: false,
			allows_users_to_create_topics: false,
		},
	});
	let raw = 0;
	let uploads = 0;
	Object.defineProperty(bot.api, 'raw', {
		value: {
			sendMessage: async (params: { text: string }) => {
				raw++;
				assert.equal(params.text, 'hello');
				return { message_id: 1 } as never;
			},
		},
	});
	const client = adaptBot(bot, {
		fetch: async (url, init) => {
			uploads++;
			assert.equal(url, 'https://api.telegram.org/bot123:fake/sendPhoto');
			assert.ok(init?.body instanceof FormData);
			assert.equal(init.body.get('photo'), 'attach://file0');
			const file = init.body.get('file0');
			assert.ok(file instanceof Blob);
			assert.equal(await file.text(), 'photo');
			return success({ message_id: 2 });
		},
	});
	assert.deepEqual(await client.call('sendMessage', { chat_id: 1, text: 'hello' }), {
		message_id: 1,
	});
	assert.deepEqual(
		await client.call('sendPhoto', { chat_id: 1, photo: new InputFile(Buffer.from('photo')) }),
		{ message_id: 2 },
	);
	assert.equal(raw, 1);
	assert.equal(uploads, 1);
	await assert.rejects(
		adaptBot({ token: 'fake', api: { raw: {} } }).call('unknown'),
		/Unknown grammy API method/,
	);
});

it('honors a real 429 response through the execution facade without a network request', async () => {
	const { createTelegramToolFacade } = await import('../tools/execution.ts');
	const { openTestDatabase } = await import('../lib/open-test-database.ts');
	const { initTelegramTables } = await import('../init_telegram_tables.ts');
	const db = await openTestDatabase();
	initTelegramTables(db);
	let requests = 0;
	let now = 0;
	const delays: number[] = [];
	const client = createApiClient('fake', {
		fetch: async () => {
			requests++;
			return requests === 1
				? Response.json({
						ok: false,
						error_code: 429,
						description: 'wait',
						parameters: { retry_after: 2 },
					})
				: Response.json({ ok: true, result: { message_id: 42, chat: { id: 1 }, date: 1 } });
		},
	});
	const facade = createTelegramToolFacade({
		client,
		execute: true,
		now: () => now,
		sleep: async (ms) => {
			delays.push(ms);
			now += ms;
		},
	});
	const result = await facade.handler(db, 'tg_send', {
		subcommand: 'send_message',
		chatId: 1,
		text: 'hello',
	});
	assert.equal(result.ok, true);
	assert.equal(requests, 2);
	assert.ok(delays.includes(2000));
	db.close();
});
