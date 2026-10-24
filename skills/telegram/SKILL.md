---
name: telegram
description: "Read and search Telegram messages, send replies, and moderate chats. Use when managing Telegram conversations or inspecting the local message mirror."
license: "MIT"
compatibility: "Node.js 24 or newer. MCP stdio or ghostpaw-telegram CLI."
---

# telegram

Read and search the local Telegram message mirror before replying. Use send and moderation tools only for intended chat actions. TELEGRAM_BOT_TOKEN enables execution through the Telegram Bot API; without it these tools return plans. Never disclose tokens. The mirror is populated by the consuming application transport.

## Calling tools

MCP: connect to ghostpaw-telegram, then call a tool by name with its JSON arguments.

CLI: `ghostpaw-telegram call <tool> '<JSON object>'` or `ghostpaw-telegram <tool> --parameter value` (without a global install: `npx -y @ghostpaw/telegram <tool> ...`).

Inspect schemas with `ghostpaw-telegram describe <tool>`. Use `--db <path>` to select a database.

## tg_read

Read and query the Telegram database: messages, chats, users, reactions, and more.

Use when: Use when you need to inspect stored messages, find chats or users, search text, or retrieve reaction and edit history.

Not for: Do not use for sending, editing, or deleting messages.

Read-only.

| Parameter | Type | Required | Values / description |
| --- | --- | --- | --- |
| subcommand | string | yes | get_message, list_messages, search_messages, get_chat, list_chats, get_user, list_users, get_reactions, reply_chain, edit_history. Which read operation to perform |
| chatId | integer | no | Chat ID |
| messageId | integer | no | Message ID |
| userId | integer | no | User ID |
| query | string | no | Full-text search query |
| limit | integer | no | Max results |
| before | integer | no | Before this timestamp (ms) |
| after | integer | no | After this timestamp (ms) |
| threadId | integer | no | Thread ID filter |

## tg_send

Outbound actions: send, edit, delete, pin/unpin messages, send typing indicator, and forward messages.

Use when: Plans only by default. Use createTelegramToolFacade with execute: true and a client to perform actions with configurable limits. Use when you need to send or modify messages, show a typing indicator, or forward a message to another chat.

Not for: Do not use for reading or querying stored data.

Writes: writes_state.

| Parameter | Type | Required | Values / description |
| --- | --- | --- | --- |
| subcommand | string | yes | send_message, edit_message, delete_message, pin_message, unpin_message, send_typing, forward_message. The send subcommand. |
| chatId | integer | no | Chat ID |
| messageId | integer | no | Message ID |
| text | string | no | Message text |
| parseMode | string | no | Parse mode (HTML, MarkdownV2) |
| replyToMessageId | integer | no | Reply-to message ID |
| toChatId | integer | no | Destination chat ID |
| fromChatId | integer | no | Source chat ID |

## tg_manage

Moderation and chat administration: ban, unban, restrict, promote, kick users, and query member info.

Use when: Plans only by default. Use createTelegramToolFacade with execute: true and a client to perform actions with configurable limits. Use when you need to moderate users, manage chat permissions, or look up member status.

Not for: Do not use for sending messages or reading message history.

Writes: writes_state.

| Parameter | Type | Required | Values / description |
| --- | --- | --- | --- |
| subcommand | string | yes | ban_user, unban_user, restrict_user, promote_user, kick_user, get_member, list_members. The moderation subcommand. |
| chatId | integer | no | The chat ID. |
| userId | integer | no | The user ID. |
| untilDate | integer | no | Unix timestamp until the action applies. |
| deleteMessages | boolean | no | Delete messages on ban. |
| canSendMessages | boolean | no | Whether the user can send messages. |
| isAdmin | boolean | no | Grant or revoke admin. |
| status | string | no | creator, administrator, member, restricted, left, kicked. Filter by member status. |
| limit | integer | no | Max members to return. |

## tg_connect

Query bot connection status, configuration, and chat list.

Use when: Use to retrieve bot statistics, stored state values, or a list of active chats.

Not for: Do not use for sending messages or moderating users.

Read-only.

| Parameter | Type | Required | Values / description |
| --- | --- | --- | --- |
| subcommand | string | yes | get_stats, get_state, list_chats. The connect subcommand. |
| key | string | no | The state key to look up. |
| limit | integer | no | Max chats to return. |

## Workflow guides

- [manage-telegram-conversations](references/manage-telegram-conversations.md): Retrieve, search, and navigate conversation history across chats and threads.
- [handle-group-administration](references/handle-group-administration.md): Inspect and update chat membership, admin rights, and chat metadata.
- [stream-progressive-responses](references/stream-progressive-responses.md): Send long responses progressively by editing a message in place as content is generated.
- [moderate-chat-effectively](references/moderate-chat-effectively.md): Detect and respond to rule violations, spam, and unwanted content in group chats.
- [search-and-retrieve-messages](references/search-and-retrieve-messages.md): Find specific messages using full-text search, filters, and reply-chain traversal.
- [broadcast-to-audience](references/broadcast-to-audience.md): Send a message to many chats or users with rate limiting and error tracking.

## Principles

- Search the mirror before replying.
- Confirm the target chat and intended moderation action.
- Keep Telegram tokens private.
