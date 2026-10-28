export const telegramSkillShort = `# Telegram CLI cheat sheet

Install (Node 24+):
  npm install -g @ghostpaw/telegram
Version:
  ghostpaw-telegram --version

List tools:
  ghostpaw-telegram tools
Inspect a tool:
  ghostpaw-telegram describe tg_read
Call a tool with JSON:
  ghostpaw-telegram call tg_read '{"subcommand":"list_chats"}'
Use parameter flags:
  ghostpaw-telegram tg_read --subcommand list_chats
Select a mirror database:
  ghostpaw-telegram --db ./telegram.db tools
Start MCP over stdio:
  ghostpaw-telegram mcp

Read the full skill:
  ghostpaw-telegram skill
List workflow guides:
  ghostpaw-telegram skill --list
Read a guide (use a name from --list):
  ghostpaw-telegram skill search-and-retrieve-messages
Print this compact cheat sheet:
  ghostpaw-telegram skill --short
Show skill command help:
  ghostpaw-telegram skill --help

Set TELEGRAM_BOT_TOKEN for Telegram API operations.
The local mirror can contain private messages and files.
`;
