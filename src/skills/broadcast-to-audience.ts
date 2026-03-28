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
