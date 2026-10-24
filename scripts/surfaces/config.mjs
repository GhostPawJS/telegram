import { readFileSync } from 'node:fs';
import { telegramSkills } from '../../src/skills/skill_registry.ts';
import { telegramSkillSpec } from '../../src/surface/telegram_skill_spec.ts';
import { telegramSurfaceTools } from '../../src/surface/telegram_surface_tools.ts';

const pkg = JSON.parse(readFileSync(new URL('../../package.json', import.meta.url), 'utf8'));
export const config = {
	slug: 'telegram',
	skill: telegramSkillSpec,
	workflows: telegramSkills,
	manifest: {
		name: 'ghostpaw-telegram',
		version: pkg.version,
		description: 'Telegram message mirror, search, sending, and moderation tools.',
		author: pkg.author,
		homepage: pkg.homepage,
		repository: pkg.repository.url,
		license: pkg.license,
		keywords: pkg.keywords,
		server: 'ghostpaw-telegram',
		packageName: pkg.name,
		mcpName: 'io.github.GhostPawJS/telegram',
		title: 'GhostPaw Telegram',
		websiteUrl: pkg.homepage,
		environment: [
			{
				name: 'TELEGRAM_BOT_TOKEN',
				description: 'Telegram Bot API token; enables send and moderation execution',
				isSecret: true,
			},
			{
				name: 'GHOSTPAW_TELEGRAM_DB',
				description: 'SQLite database path (default: ~/.ghostpaw/telegram.db)',
			},
		],
	},
};

export const mcpbSpec = {
	...config.manifest,
	longDescription:
		'Read and search a local Telegram mirror, send messages, and moderate chats through the Telegram Bot API.',
	documentation: 'https://github.com/GhostPawJS/telegram/blob/main/README.md',
	support: pkg.bugs.url,
	entryPoint: 'server/mcp-server.js',
	env: {
		TELEGRAM_BOT_TOKEN: `\${user_config.bot_token}`,
		GHOSTPAW_TELEGRAM_DB: `\${user_config.db_path}`,
	},
	userConfig: {
		bot_token: {
			type: 'string',
			title: 'Telegram token',
			description: 'Bot API token for send and moderation execution.',
			required: false,
			default: '',
			sensitive: true,
		},
		db_path: {
			type: 'string',
			title: 'Database path',
			description: 'Path to the local SQLite database.',
			required: false,
			default: `\${HOME}/.ghostpaw/telegram.db`,
		},
	},
	tools: telegramSurfaceTools.map(({ name, description }) => ({ name, description })),
};
