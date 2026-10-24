import { telegramSurfaceTools } from './surface/telegram_surface_tools.ts';
import { runToolCli } from './surfaces/cli.ts';
import { telegramVersion } from './version.ts';

process.exitCode = await runToolCli(process.argv.slice(2), {
	bin: 'ghostpaw-telegram',
	version: telegramVersion,
	description: 'Telegram message mirror and chat tools',
	tools: telegramSurfaceTools,
	openContext: async (options) => {
		const { openTelegramDb } = await import('./surface/open_telegram_db.ts');
		const { resolveTelegramDbPath } = await import('./surface/resolve_telegram_db_path.ts');
		return openTelegramDb(
			resolveTelegramDbPath(options.db === undefined ? {} : { flag: options.db }),
		);
	},
	closeContext: (db) => db.close(),
	commands: {
		mcp: async (options) => {
			const { serveTelegramMcp } = await import('./surface/serve_telegram_mcp.ts');
			await serveTelegramMcp(options.db === undefined ? {} : { dbPath: options.db });
		},
		skill: async () => {
			const { renderSkillMarkdown } = await import('./surfaces/skill_markdown.ts');
			const { telegramSkillSpec } = await import('./surface/telegram_skill_spec.ts');
			return renderSkillMarkdown(telegramSkillSpec);
		},
	},
});
