import { defineTelegramSkill } from './skill_types.ts';

export const searchAndRetrieveMessages = defineTelegramSkill({
	name: 'search-and-retrieve-messages',
	description: 'Find specific messages using full-text search, filters, and reply-chain traversal.',
	content: `
## Searching and Retrieving Messages

### Full-text search
\`\`\`typescript
// tg_read → search_messages
{ subcommand: 'search_messages', chatId: -100123, query: 'budget proposal', limit: 5 }
\`\`\`
- Returns snippets with match highlights; use \`get_message\` to fetch the full record
- FTS5 supports phrase queries (\`"exact phrase"\`) and prefix search (\`budg*\`)
- Only searches \`text_plain\` — captions and media metadata are not indexed separately

### Filtering by time
\`\`\`typescript
{ subcommand: 'list_messages', chatId, before: Date.now(), after: weekAgo, limit: 50 }
\`\`\`
- \`before\` and \`after\` are Unix millisecond timestamps
- Combine with \`threadId\` to scope to a forum topic

### Navigating context
- \`reply_chain\` returns messages root-first up to \`maxDepth\` (default 50)
- Use this before answering a question to ensure you have the full context

### Edit history
- \`edit_history\` returns all captured edits in chronological order
- Useful for auditing what was changed and when

### Good patterns
- Narrow \`chatId\` before searching — cross-chat search is O(all messages)
- Use \`limit\` aggressively; start small and paginate if needed
- After \`search_messages\`, call \`get_message\` for full \`entities\`, \`media\`, and \`raw\` fields

### Do not
- Do not search without a \`chatId\` — it will return results from all chats unexpectedly
- Do not rely on snippet text for logic — always fetch the full message
`.trim(),
});
