# LLM Usage

Agent builder guide for `@ghostpaw/telegram`.

For direct-code usage, read [HUMAN.md](HUMAN.md) instead.

## Runtime Stack

```
soul     →  thinking foundation for the system prompt
tools    →  intent-shaped actions with JSON Schema
skills   →  reusable workflow playbooks as markdown
```

The layers are additive and independent. Use any subset.

**`soul`** establishes the Herald posture: read from the mirror, fetch from the network, one canonical graph, Telegram is the live authority, render before sending. Inject it into the system prompt before task instructions.

**`tools`** exposes 4 JSON-schema tool definitions that the LLM calls by name. Each tool has a `handler(db, input)` that executes synchronously against SQLite or returns an action descriptor. Every result is a discriminated `ToolResult` with `ok`, `outcome`, `data`, and `next` (next-step hints).

**`skills`** provides 6 markdown workflow playbooks. Inject `skill.content` into the system prompt or tool-use loop as a reasoning scaffold for specific task types.

## Tools

| Tool | `sideEffects` | Description |
|---|---|---|
| `tg_read` | `none` | Query messages, chats, users, and reactions from the local SQLite mirror. Subcommands: `get_message`, `list_messages`, `search_messages`, `get_chat`, `list_chats`, `get_user`, `list_users`, `get_reactions`, `reply_chain`, `edit_history`. |
| `tg_send` | `writes_state` | Outbound actions: send, edit, delete, pin, unpin messages; send typing indicator; forward messages. Subcommands: `send_message`, `edit_message`, `delete_message`, `pin_message`, `unpin_message`, `send_typing`, `forward_message`. |
| `tg_manage` | `writes_state` | Moderation and chat administration: ban, unban, restrict, promote, kick users; query member status. Subcommands: `ban_user`, `unban_user`, `restrict_user`, `promote_user`, `kick_user`, `get_member`, `list_members`. |
| `tg_connect` | `none` | Query bot stats, stored state, and chat list. Subcommands: `get_stats`, `get_state`, `list_chats`. |

`tg_send` and `tg_manage` return action descriptors — the bot harness is responsible for executing the Telegram API call. `tg_read` and `tg_connect` return data directly from SQLite.

## Skills

| Skill | Description |
|---|---|
| `manage-telegram-conversations` | Retrieve, search, and navigate conversation history across chats and threads. |
| `handle-group-administration` | Inspect and update chat membership, admin rights, and chat metadata. |
| `stream-progressive-responses` | Send long responses progressively by editing a message in place as content is generated. |
| `moderate-chat-effectively` | Detect and respond to rule violations, spam, and unwanted content in group chats. |
| `search-and-retrieve-messages` | Find specific messages using full-text search, filters, and reply-chain traversal. |
| `broadcast-to-audience` | Send a message to many chats or users with rate limiting and error tracking. |

## Wiring Example

```ts
import { DatabaseSync } from 'node:sqlite';
import { tools } from '@ghostpaw/telegram';

const db = new DatabaseSync('bot.db');

// Build tool list for the model
const toolDefs = tools.listTelegramToolDefinitions().map((t) => ({
  name: t.name,
  description: t.description,
  inputSchema: t.inputSchema,
}));

// After the model selects a tool:
async function dispatchTool(name: string, input: unknown) {
  const tool = tools.getTelegramToolByName(name);
  if (!tool) throw new Error(`Unknown tool: ${name}`);
  return tool.handler(db, input as never);
}

// Check the result
const result = await dispatchTool('tg_read', {
  subcommand: 'search_messages',
  chatId: -100123456,
  query: 'budget proposal',
  limit: 5,
});

if (result.ok) {
  console.log(result.data);  // typed payload
} else {
  console.error(result.error?.message, result.error?.recovery);
}
```

`listTelegramToolDefinitions()` returns all 4 definitions. `getTelegramToolByName(name)` returns the matching definition or `null`. The `handler` signature is `(db: TelegramDb, input: TInput) => ToolResult`.

## Soul

```ts
import { soul } from '@ghostpaw/telegram';

// soul.telegramSoul exposes:
// .slug        → 'herald'
// .name        → 'Herald'
// .description → one-line summary
// .essence     → extended thinking foundation
// .traits      → Array<{ principle, provenance }>

const foundation = soul.renderTelegramSoulPromptFoundation();
// Inject before your task instructions in the system prompt.
```

`telegramSoul.slug === 'herald'`. The four principles encoded in the soul: read from the mirror / fetch from the network, one canonical graph for all entities, Telegram is the authority for live state, render before you send.
