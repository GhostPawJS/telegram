import { defineTelegramSkill } from './skill_types.ts';

export const manageTelegramConversations = defineTelegramSkill({
	name: 'manage-telegram-conversations',
	description: 'Retrieve, search, and navigate conversation history across chats and threads.',
	content: `
## Managing Telegram Conversations

Use \`tg_read\` to inspect messages, chats, and threads stored in the local database.

### Retrieving messages
- \`get_message\` — fetch a single message by chatId + messageId
- \`list_messages\` — paginate recent messages in a chat; use \`before\`/\`after\` for time windows, \`threadId\` for forum topics
- \`reply_chain\` — walk reply-to-message links back to the root; useful for context reconstruction

### Searching
- \`search_messages\` — full-text search within a chat using FTS5; returns snippets with match highlights
- Always filter by \`chatId\` — cross-chat search is not supported

### Threads and albums
- Messages with the same \`threadId\` belong to a forum topic thread
- Messages with the same \`mediaGroupId\` are part of a media album — fetch all with \`list_messages\` filtered by that id

### Good patterns
- Reconstruct context: \`reply_chain\` → summarise the thread before responding
- Find recent activity: \`list_messages\` with a small \`limit\` and no \`before\`/\`after\`
- Locate a past message: \`search_messages\` then \`get_message\` for the full record

### Do not
- Do not delete or edit messages without an explicit user instruction
- Do not assume a message exists — always check the \`ok\` field before using data
`.trim(),
});
