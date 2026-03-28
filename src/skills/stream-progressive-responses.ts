import { defineTelegramSkill } from './skill_types.ts';

export const streamProgressiveResponses = defineTelegramSkill({
	name: 'stream-progressive-responses',
	description:
		'Send long responses progressively by editing a message in place as content is generated.',
	content: `
## Streaming Progressive Responses

Use \`createStream\` from the \`write\` surface to send text incrementally.

### Basic usage
\`\`\`typescript
const stream = createStream(bot, { chatId, debounceMs: 300 });
stream.write('Starting to think...');
// ... generate content in chunks ...
stream.write(' Here is what I found:');
await stream.end(); // flushes final content
\`\`\`

### Edit vs send
- Omit \`messageId\` → sends a new message, then edits it in place as chunks arrive
- Provide \`messageId\` → edits an existing message from the start

### Overflow
- When accumulated text exceeds \`maxLength\` (default 4096), the stream automatically splits into a second message
- Set \`maxLength: 1024\` for captions (photo/video messages)

### Options
- \`debounceMs\` — how long to wait before flushing pending writes (default 300 ms); lower = more API calls
- \`parseMode\` — \`'HTML'\` or \`'MarkdownV2'\`; use \`render.markdownToHtml\` to convert before writing
- \`onError\` — called if a Telegram API call fails; stream continues buffering regardless

### Good patterns
- Write a placeholder first (\`"Thinking..."\`), then overwrite with real content
- Use \`stream.text\` to inspect accumulated content before \`end()\`
- Always \`await stream.end()\` — do not fire-and-forget

### Do not
- Do not call \`write()\` after \`end()\`
- Do not set \`debounceMs\` below 100 ms in production — Telegram rate-limits edits to ~20/min per message
`.trim(),
});
