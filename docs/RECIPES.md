# Telegram UI/UX Recipes

Practical patterns for building polished Telegram bots. Each recipe is self-contained — mix and match freely.

---

## 1. Acknowledge → Think → Respond

Show the user their message was received before doing any async work.

```js
// On every incoming message:
await write.setReaction(client, chatId, messageId, [{ type: 'emoji', emoji: '👀' }]);
await write.sendChatAction(client, chatId, 'typing');

// ... do your work ...

await write.setReaction(client, chatId, messageId, [{ type: 'emoji', emoji: '👍' }]);
```

**Good for:** Any handler that touches a DB, calls an API, or runs LLM inference. Users get instant visual confirmation that the bot is alive.

**Limits:**
- `sendChatAction` auto-expires after ~5 seconds. For long tasks, call it repeatedly in a loop.
- Reactions only work on messages in chats where the bot is a member. Fails silently in channels.
- Only one reaction per user per message — setting `👍` replaces `👀`.

---

## 2. Progressive Streaming

Send a placeholder message and edit it in-place as content arrives. The user sees the text grow rather than waiting for a complete response.

```js
const stream = write.createStream(client, { chatId });

// write() is fire-and-forget with debounce — good for high-frequency token streams
stream.write('The ');
stream.write('quick ');
stream.write('brown ');
await stream.end(); // flushes final state

// append() flushes immediately — good for step-by-step progress
await stream.append('Step 1 done\n');
await stream.append('Step 2 done\n');

// replace() resets the whole buffer and flushes — good for animated states
await stream.replace('Thinking.');
await stream.replace('Thinking..');
await stream.replace('Thinking...');
await stream.replace('Done!');
```

**Good for:** LLM token streaming, progress indicators, animated status messages.

**Limits:**
- Telegram rate-limits edits to ~1 per second per message. The debounce (default 300ms) handles this automatically for `write()`.
- Messages over 4096 characters automatically overflow into a second message.
- You cannot stream into a message you didn't send (no `messageId` from a user message).

---

## 3. Reply-to in DMs, Plain Send in Groups

In a private chat, threading your response to the user's message keeps the conversation readable. In groups, it's noise.

```js
const isDm = chat?.type === 'private';
const replyOpts = isDm ? { replyToMessageId: messageId } : {};

await write.sendMessage(client, chatId, 'Hello!', { parseMode: 'HTML', ...replyOpts });
```

**Good for:** Any message handler that should behave differently in private vs. group context.

**Limits:**
- If the original message was deleted before your reply sends, Telegram silently drops the `reply_to` and sends a plain message — no error thrown.

---

## 4. Inline Keyboard — Routing via `callback_data`

Attach tappable buttons to any message. When tapped, Telegram fires a `callback_query` event (not a chat message). You must call `answer()` to clear the loading spinner on the button.

```js
const markup = keyboards.inlineKeyboard([
  [
    keyboards.callbackButton('✅ Confirm', 'action:confirm'),
    keyboards.callbackButton('❌ Cancel', 'action:cancel'),
  ],
  [keyboards.urlButton('Docs →', 'https://example.com')],
]);

await write.sendMessage(client, chatId, 'Proceed?', { replyMarkup: markup });

// In onCallback:
async onCallback({ callback, answer }) {
  const [prefix, choice] = (callback.data ?? '').split(':');
  if (prefix === 'action') {
    await answer(choice === 'confirm' ? 'Confirmed!' : 'Cancelled.');
    await write.editMessage(client, callback.chatId, callback.messageId,
      `You chose: <b>${choice}</b>`, { parseMode: 'HTML' });
  }
}
```

**Good for:** Confirmations, polls, menus, multi-step forms, any choice that shouldn't pollute the chat with text messages.

**Limits:**
- `callback_data` max **64 bytes** (UTF-8). Encode a short ID and look up state in your DB — don't try to stuff full payloads in.
- Buttons only work on messages sent by your bot. You cannot add buttons to user messages.
- `answer()` toast text max **200 characters**, displayed for ~5 seconds.
- After you edit the message to remove `reply_markup`, the buttons are gone permanently.
- Telegram will keep showing a spinner until `answer()` is called (~30s timeout). Always call it, even on error.

---

## 5. LLM Agent Approval Gate

Pause an agent mid-execution and require human sign-off before a risky action. The approval card stays as a permanent audit trail in the chat.

```js
// 1. Agent reaches a risky step — store pending state, send approval card
const id = Math.random().toString(36).slice(2, 10); // 8-char ID fits in callback_data
pendingApprovals.set(id, { action, chatId });
setTimeout(() => pendingApprovals.delete(id), 5 * 60 * 1000); // auto-expire

const markup = keyboards.inlineKeyboard([[
  keyboards.callbackButton('✅ Allow', `approve:${id}:allow`),
  keyboards.callbackButton('❌ Deny',  `approve:${id}:deny`),
]]);
await write.sendMessage(client, chatId, formatApprovalCard(action), {
  parseMode: 'HTML', replyMarkup: markup,
});

// 2. In onCallback — handle the decision
const [, id, decision] = (callback.data ?? '').split(':');
const pending = pendingApprovals.get(id);
if (!pending) { await answer('Request expired.'); return; }
pendingApprovals.delete(id);

if (decision === 'deny') {
  await answer('Cancelled.');
  // Edit card to show denied (removes buttons, creates audit record)
  await write.editMessage(client, callback.chatId, callback.messageId,
    formatApprovalCard(pending.action) + '\n\n<b>❌ Denied.</b>', { parseMode: 'HTML' });
} else {
  await answer('Approved — executing.');
  await write.editMessage(client, callback.chatId, callback.messageId,
    formatApprovalCard(pending.action) + '\n\n<b>✅ Approved.</b>', { parseMode: 'HTML' });

  // Stream the execution log into a new message
  const stream = write.createStream(client, { chatId, parseMode: 'HTML' });
  for (const step of pending.action.steps) {
    await stream.append(`<code>  › ${step}</code>\n`);
    await new Promise(r => setTimeout(r, 800));
  }
}
```

**Good for:** Destructive operations (deletes, sends, deployments), LLM tool-call confirmation, human-in-the-loop pipelines.

**Limits:**
- The approval is in-memory — a bot restart loses all pending approvals. For production, persist them in SQLite with an `expires_at` column.
- Buttons on the original card remain clickable until edited — a second tap after the first resolves will hit the "expired" path, which is correct behavior.
- The pattern is one-shot (first tap wins). For multi-voter consensus, track individual votes in the DB and only execute when a threshold is reached.

---

## 6. Multi-step Form via Button Flow

Chain multiple approval/choice screens by editing the same message each step, carrying state through a short DB-backed session ID.

```js
// Step 1 — send first question
const sessionId = shortId();
sessions.set(sessionId, { step: 1, answers: {} });

await write.sendMessage(client, chatId, '<b>Q1:</b> How urgent is this?', {
  parseMode: 'HTML',
  replyMarkup: keyboards.inlineKeyboard([[
    keyboards.callbackButton('🔴 High',   `form:${sessionId}:urgency:high`),
    keyboards.callbackButton('🟡 Medium', `form:${sessionId}:urgency:medium`),
    keyboards.callbackButton('🟢 Low',    `form:${sessionId}:urgency:low`),
  ]]),
});

// In onCallback — advance to next step
const [, sid, field, value] = callback.data.split(':');
const session = sessions.get(sid);
session.answers[field] = value;
session.step++;

if (session.step === 2) {
  await write.editMessage(client, callback.chatId, callback.messageId,
    `<b>Q2:</b> Assign to whom?`, {
      parseMode: 'HTML',
      replyMarkup: keyboards.inlineKeyboard([[
        keyboards.callbackButton('Alice', `form:${sid}:assignee:alice`),
        keyboards.callbackButton('Bob',   `form:${sid}:assignee:bob`),
      ]]),
    });
} else {
  // Final step — show summary, no more buttons
  await write.editMessage(client, callback.chatId, callback.messageId,
    `<b>Submitted</b>\nUrgency: ${session.answers.urgency}\nAssignee: ${session.answers.assignee}`,
    { parseMode: 'HTML' });
  sessions.delete(sid);
}
```

**Good for:** Ticket creation, survey flows, configuration wizards — anywhere you want to collect structured input without asking users to type.

**Limits:**
- Each step encodes the session ID in `callback_data`, so keep the session ID short (8 chars = safe).
- If the user never completes the form, the session leaks. Always set an expiry timeout.
- Telegram does not prevent a user from tapping old steps after advancing — guard by checking `session.step` before acting.

---

## 7. Paginated List

Show a long list in pages by editing the message and updating the navigation buttons.

```js
function pageMessage(items, page, pageSize) {
  const total = Math.ceil(items.length / pageSize);
  const slice = items.slice(page * pageSize, (page + 1) * pageSize);
  const text = slice.map((item, i) => `${page * pageSize + i + 1}. ${item}`).join('\n');
  const nav = [];
  if (page > 0)          nav.push(keyboards.callbackButton('← Prev', `page:${page - 1}`));
  if (page < total - 1)  nav.push(keyboards.callbackButton('Next →', `page:${page + 1}`));
  return {
    text: `<b>Results</b> (page ${page + 1}/${total})\n\n${text}`,
    markup: nav.length ? keyboards.inlineKeyboard([nav]) : undefined,
  };
}

// Send first page
const { text, markup } = pageMessage(results, 0, 10);
await write.sendMessage(client, chatId, text, { parseMode: 'HTML', replyMarkup: markup });

// In onCallback for 'page:N'
const page = parseInt(callback.data.split(':')[1]);
const { text, markup } = pageMessage(results, page, 10);
await write.editMessage(client, callback.chatId, callback.messageId, text,
  { parseMode: 'HTML', replyMarkup: markup });
await answer();
```

**Good for:** Search results, history lists, leaderboards, any collection too long for one message.

**Limits:**
- The `results` array needs to be re-fetched or stored. Don't embed data in `callback_data` — you'll hit the 64-byte limit immediately.
- A message with no `reply_markup` shows no buttons. Pass `undefined` for the last page's `replyMarkup` to cleanly remove navigation.

---

## 8. Broadcast with Back-pressure

Send a message to many chats without getting rate-limited.

```js
const result = await write.broadcast(client, chatIds, '<b>Important update</b>', {
  parseMode: 'HTML',
});
console.log(`sent: ${result.sent}, failed: ${result.failed}`);
```

**Good for:** Announcements, alerts, digest newsletters to all known chats.

**Limits:**
- Telegram allows ~30 messages/second globally and ~1 message/second per chat. The built-in `broadcast` applies back-pressure automatically.
- Failed sends (bot blocked, chat deleted) are counted in `result.failed` and do not throw.
- Do not use broadcast for personalized messages — send them individually.

---

## 9. HTML Formatting Reference

Telegram supports a safe HTML subset. Use `render.escapeHtml()` on any user-supplied content before embedding it.

```js
const msg =
  `<b>bold</b>  <i>italic</i>  <u>underline</u>  <s>strikethrough</s>\n` +
  `<code>inline code</code>\n` +
  `<pre>code block</pre>\n` +
  `<pre><code class="language-js">const x = 1;</code></pre>\n` +
  `<a href="https://example.com">link text</a>\n` +
  `<blockquote>quoted text</blockquote>\n` +
  `<tg-spoiler>hidden until tapped</tg-spoiler>`;

await write.sendMessage(client, chatId, msg, { parseMode: 'HTML' });
```

**Good for:** Any response that benefits from structure — error messages, summaries, code output, approval cards.

**Limits:**
- Only the tags above are supported. Unknown tags are stripped. `<br>` is not supported — use `\n`.
- `<pre>` with a language class enables syntax highlighting in supported clients (desktop/iOS/Android).
- URLs in `<a href>` must be `http://` or `https://`. `tg://` deep links also work.
- Always escape user input: `render.escapeHtml(userText)` converts `<`, `>`, `&` to safe entities.

---

## 10. Full-Text Search with Snippets

Search stored messages using SQLite FTS5, with highlighted match context.

```js
const results = read.searchMessages(db, chatId, 'deployment failed', { limit: 5 });
// results: [{ chatId, messageId, date, snippet }]
// snippet has **match** markers by default

const lines = results.map(r =>
  `• <code>[${r.messageId}]</code> ${r.snippet}`
);
await write.sendMessage(client, chatId, lines.join('\n'), { parseMode: 'HTML' });
```

**Good for:** Chat history search, finding past decisions, audit log queries.

**Limits:**
- FTS5 index is updated via triggers on insert/update/delete — always in sync, zero extra code needed.
- Minimum token length is 3 characters (SQLite FTS5 default). Very short queries return no results.
- Search is per-chat. Cross-chat search requires dropping the `chatId` constraint in the query.
- Deleted messages (`isDeleted: true`) are excluded from search results.

---

## 11. Reply Chain Traversal

Reconstruct a conversation thread by walking `reply_to_message_id` back to the root.

```js
// User replies to a message and sends /chain
const chain = read.replyChain(db, chatId, replyToMessageId);
// chain: StoredMessage[], root-first, up to 50 deep by default

const lines = chain.map((m, i) =>
  `${i + 1}. <b>${render.escapeHtml(m.fromDisplayName)}</b>: ` +
  render.escapeHtml(m.text?.slice(0, 80) ?? `(${m.type})`)
);
await write.sendMessage(client, chatId,
  `<b>Thread (${chain.length} messages)</b>\n${lines.join('\n')}`,
  { parseMode: 'HTML' });
```

**Good for:** Summarising a discussion thread, feeding conversation context to an LLM, moderation tools.

**Limits:**
- Only messages your bot has seen are stored. If the bot joined mid-conversation, earlier messages are absent.
- Max depth defaults to 50. Circular references (impossible in Telegram but theoretically injectable) are safe — the CTE depth limit stops them.
- Returns an empty array for messages with no reply chain — always check `chain.length`.
