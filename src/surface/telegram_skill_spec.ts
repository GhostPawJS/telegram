import { telegramSkills } from '../skills/skill_registry.ts';
import { telegramMcpInstructions } from './telegram_mcp_instructions.ts';
import { telegramSurfaceTools } from './telegram_surface_tools.ts';
export const telegramSkillSpec = {
	name: 'telegram',
	description:
		'Read and search Telegram messages, send replies, and moderate chats. Use when managing Telegram conversations or inspecting the local message mirror.',
	license: 'MIT',
	compatibility:
		'Release binary ghostpaw-telegram (no runtime needed); MCP stdio via ghostpaw-telegram mcp.',
	bin: 'ghostpaw-telegram',
	packageName: '@ghostpaw/telegram',
	server: 'ghostpaw-telegram',
	about: `${telegramMcpInstructions}

## Running inside sandboxed agent harnesses

Inside a Codex CLI \`--sandbox workspace-write\` session, the database and its
parent directory must be inside a writable root, including SQLite's \`-wal\` and
\`-shm\` side files. A default DB under \`~/.ghostpaw\` outside those roots can fail
with \`SQLITE_CANTOPEN\` or \`EPERM\` (often exit 70; directory creation failures
may exit 2), even when normal shell permissions allow access. Put the DB inside the workspace with \`--db ./state/telegram.db\`,
or set \`GHOSTPAW_TELEGRAM_DB="$PWD/state/telegram.db"\` for CLI/MCP use.

To use an external DB directory, add it when starting the OpenAI Codex CLI
(replace \`<dir-with-db>\` with its absolute path):

\`\`\`sh
codex exec --sandbox workspace-write --add-dir <dir-with-db> "Run the GhostPaw CLI"
\`\`\`

Alternatively, set \`sandbox_workspace_write.writable_roots\` in
\`~/.codex/config.toml\` before starting the session:

\`\`\`toml
[sandbox_workspace_write]
writable_roots = ["/absolute/dir-with-db"]
\`\`\`
`,
	tools: telegramSurfaceTools,
	workflows: telegramSkills,
	principles: [
		'Search the mirror before replying.',
		'Confirm the target chat and intended moderation action.',
		'Keep Telegram tokens private.',
	],
};
