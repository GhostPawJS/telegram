import { defineTelegramSkill } from './skill_types.ts';

export const broadcastToAudience = defineTelegramSkill({
	name: 'broadcast-to-audience',
	description: 'Send a message to many chats or users with rate limiting and error tracking.',
	content: `
## Broadcasting to an Audience

Use \`write.broadcast\` to send the same message to multiple chats.

### Basic usage
\`\`\`typescript
const result = await broadcast(bot, chatIds, text, {
  parseMode: 'HTML',
  delayMs: 100,       // pause between sends (default 50 ms)
  onError: (chatId, err) => console.error(chatId, err),
});
console.log(result.sent, result.failed);
\`\`\`

### Media URLs
Media send helpers accept \`{ url: string }\` for HTTP/HTTPS downloads.
All DNS answers and redirect targets are checked, and connections use validated addresses.
Private and local targets are blocked by default. Limits are 50 MiB, 30 seconds overall,
and five redirects. Configure \`mediaMaxBytes\` and \`mediaTimeoutMs\` in client options
(or \`createBot\`'s \`api\` options). Explicit \`allowPrivateMediaUrls: true\` or
\`GHOSTPAW_TELEGRAM_ALLOW_PRIVATE_URLS=1\` permits private targets, including local
services and metadata endpoints. Use this opt-in only with trusted URLs.
Media downloads use Node HTTP/HTTPS directly, independently of the Bot API fetch option.

### Getting the audience
- \`tg_read\` → \`list_chats\` — returns all known active chats
- Filter by \`type\` (\`'group'\`, \`'supergroup'\`, \`'channel'\`) as needed
- Check \`isActive\` — migrated or left chats have \`isActive: false\`

### Rate limiting
- Telegram allows ~30 messages/second globally and ~20 messages/minute per chat
- Set \`delayMs: 50\` for small audiences; increase to \`200\`+ for thousands of chats
- Errors from rate-limited chats appear in \`result.errors\` — retry them separately

### Good patterns
- Pre-render HTML once with \`render.markdownToHtml\` before the loop
- Always provide \`onError\` to log failures without stopping the broadcast
- After broadcast, report \`result.sent\` and \`result.failed\` to the operator

### Do not
- Do not broadcast without operator confirmation — it is irreversible
- Do not set \`delayMs: 0\` for large audiences — you will hit Telegram's flood limits
- Do not include @mentions of specific users in broadcast messages
`.trim(),
});
