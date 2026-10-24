import { telegramSkills } from '../skills/skill_registry.ts';
import { telegramMcpInstructions } from './telegram_mcp_instructions.ts';
import { telegramSurfaceTools } from './telegram_surface_tools.ts';
export const telegramSkillSpec = {
	name: 'telegram',
	description:
		'Read and search Telegram messages, send replies, and moderate chats. Use when managing Telegram conversations or inspecting the local message mirror.',
	license: 'MIT',
	compatibility: 'Node.js 24 or newer. MCP stdio or ghostpaw-telegram CLI.',
	bin: 'ghostpaw-telegram',
	packageName: '@ghostpaw/telegram',
	server: 'ghostpaw-telegram',
	about: telegramMcpInstructions,
	tools: telegramSurfaceTools,
	workflows: telegramSkills,
	principles: [
		'Search the mirror before replying.',
		'Confirm the target chat and intended moderation action.',
		'Keep Telegram tokens private.',
	],
};
