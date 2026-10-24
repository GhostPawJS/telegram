import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { it } from 'node:test';

it('loads ESM and CommonJS builds and uses synchronous lazy dependencies', async () => {
	const script = `
 const require = (await import('node:module')).createRequire(import.meta.url);
 for (const pkg of [await import('./dist/index.js'), require('./dist/index.cjs')]) {
 if (pkg.render.markdownToHtml('**hi**') !== '<b>hi</b>') throw Error('html');
 if (pkg.render.markdownToMarkdownV2('**hi**') !== '*hi*') throw Error('markdown');
 const client = { call: async (method, params) => { if (typeof params.photo !== 'object') throw Error('InputFile'); return { message_id: 7 }; } };
 if ((await pkg.write.sendPhoto(client, 1, Buffer.from('photo'))).messageId !== 7) throw Error('send');
 }
 `;
	const env = { ...process.env };
	delete env.NODE_TEST_CONTEXT;
	const child = spawn(process.execPath, ['--input-type=module', '-e', script], { env });
	let stderr = '';
	child.stderr.on('data', (chunk) => {
		stderr += chunk;
	});
	const code = await new Promise<number | null>((resolve, reject) => {
		child.on('error', reject);
		child.on('close', resolve);
	});
	assert.equal(code, 0, stderr);
});
