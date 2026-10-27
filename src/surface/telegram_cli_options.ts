import type { TelegramDb } from '../database.ts';
import { telegramSkills } from '../skills/skill_registry.ts';
import { runToolCli, type ToolCliOptions } from '../surfaces/cli.ts';
import { cliVersion } from './cli_version.ts';
import { telegramCliSurfaceTools, telegramSurfaceTools } from './telegram_surface_tools.ts';

export const telegramCliOptions: ToolCliOptions<TelegramDb> = {
	bin: 'ghostpaw-telegram',
	get version() {
		return cliVersion();
	},
	formatVersion: (args) => cliVersion({ args }),
	description: 'Telegram message mirror and chat tools',
	tools: telegramCliSurfaceTools,
	openContext: async (options) => {
		const { openTelegramDb } = await import('./open_telegram_db.ts');
		const { resolveTelegramDbPath } = await import('./resolve_telegram_db_path.ts');
		return openTelegramDb(
			resolveTelegramDbPath(options.db === undefined ? {} : { flag: options.db }),
		);
	},
	closeContext: (db) => db.close(),
	commands: {
		mcp: async (options) => {
			const { serveTelegramMcp } = await import('./serve_telegram_mcp.ts');
			await serveTelegramMcp(options.db === undefined ? {} : { dbPath: options.db });
		},
		skill: async (args = []) => {
			if (args.includes('--help') || args.includes('-h'))
				return 'Usage: ghostpaw-telegram skill\n       ghostpaw-telegram skill --list\n       ghostpaw-telegram skill <guide>\n';
			if (args[0] === '--list')
				return `${telegramSkills
					.map((guide) => `${guide.name}  ${guide.description.replace(/\s+/g, ' ')}`)
					.join('\n')}\n`;
			if (args.length) {
				const guide = telegramSkills.find((guide) => guide.name === args[0]);
				if (!guide) throw new Error(`unknown guide ${args[0]}; run ghostpaw-telegram skill --list`);
				return guide.content;
			}
			const { renderSkillMarkdown } = await import('../surfaces/skill_markdown.ts');
			const { telegramSkillSpec } = await import('./telegram_skill_spec.ts');
			return renderSkillMarkdown(telegramSkillSpec);
		},
	},
};

export function runTelegramCli(argv: string[]): Promise<number> {
	const args = [...argv];
	for (let i = 0; i < args.length; i++) {
		if (args[i] === '--db') {
			args.splice(i, 2);
			i--;
		}
	}
	const first = args.find((arg) => !arg.startsWith('-'));
	const legacy =
		['call', 'describe', 'tools'].includes(first ?? '') ||
		telegramSurfaceTools.some(
			(tool) =>
				tool.name.replaceAll('_', '').toLowerCase() ===
				first?.replaceAll('-', '').replaceAll('_', '').toLowerCase(),
		);

	return runToolCli(
		argv,
		legacy ? { ...telegramCliOptions, tools: telegramSurfaceTools } : telegramCliOptions,
	);
}
