# Concept: GhostPaw Telegram

## Diagnosis
Depth pass on 2026-10-24 for the subdomain move. What stays strong: the replayed run, re-run against telegram 0.6.0 with identical output. What was thin: the page did not name the failures bot builders report. Added: group context lost when a bot only keeps what it answers, tools that act at once, and chat history held in memory. The privacy-mode limit is stated beside the first one.

## Voices
- Telegram is where people talk to their own agents: from a phone, on a plane, in one group per agent. V003 V013 V015 V016 V012
- The bot API is the reason: easy to use, long polling, no permission dance. V046 V047 V048 V049
- Sending every important action to a Telegram bot is a cheap audit trail; a message becomes a proposal, a button executes it, everything is logged. V021 V030
- Bots that stay silent or reply to the wrong person: missing allowlists, gateways that die with the shell, monitor text in a user's chat. V026 V025 V028 V005
- Session continuity and memory are the hard part of a bridge; people build SQLite memory by hand. V035 V038 V059 V056
- Rate limits, backoff and Retry-After are missing in many bot MCP servers. V033 V036
- Telegram search is a reason people stay. V045
- Privacy doubts about Telegram itself are loud. V041 V044 V050
- A bot that only answers mentions drops the rest of the group conversation and has no context when mentioned. V063
- Bot builders worry about tokens and chat content leaking into logs and config files. V067 V068
- Telegram is a common remote control for coding agents running in a terminal. V066 V070 V071
- Long-running Telegram clients that cache everything need restarts as memory fills. V069
- Replays and bot-to-bot loops cause duplicate or runaway replies. V062 V065

## Buyer
A Node.js developer building an agent that lives in Telegram chats, who has used grammY or Telegraf (P001 P002) or a Telegram bot MCP server (P003 P004) and now wants the bot to remember what was said, with edits, replies and files, without running a separate database service (V059 V035). They arrive from a thread about OpenClaw or Hermes on Telegram (V013 V026) and need to see that every update lands in SQLite before their handler runs, that the agent tools plan by default, and that sending needs an explicit switch (V030 V021). The hesitation most likely to stop them: an agent posting into a group on its own.

## Decision path
1. Will my bot remember the chat? → hero: every update mirrored into SQLite before the handler.
2. What does it keep? → the run: message, handler reply, edit history, reply chain, search.
3. Can the agent post on its own? → the run: tg_send returns a plan; execution needs execute: true.
4. Does it handle rate limits? → worry: token buckets and retry_after in the executing facade.
5. How do I start? → install line, MCP line, quick start, GitHub, README.

## Mechanism
Chosen: a replayed real run against telegram 0.6.2 on 2026-10-24. createBot runs with long polling against a local stand-in for the Bot API passed through the documented api.fetch option, so three updates arrive in a group called Renewal desk; the handler finds each message already in SQLite and sends one reply; an edit is kept in edit history; a reply builds a chain; search for "cafe" finds "café"; tg_send returns a plan. Speed: on screen at load; proof: real rows and tool results; effort: six presses; honesty: labelled as a replay with the Telegram servers replaced by a stand-in; share value: the edit history.
Rejected: a live bot demo: needs a token and would post in real chats.
Rejected: a chat-bubble animation: looks like a messenger, shows nothing stored.
Rejected: a feature grid of the eight tables: lists without proof.

## Offer
Product: @ghostpaw/telegram, an open-source Telegram bot engine for Node.js with a SQLite mirror
Price: free, MIT licence
Delivery: `npm install @ghostpaw/telegram` into a Node.js 24+ project, or `npx -y @ghostpaw/telegram mcp` as a local MCP server

## Facts
- telegram 0.6.2 is on npm with zero runtime dependencies and requires Node.js 24+ for node:sqlite. https://www.npmjs.com/package/@ghostpaw/telegram
- Every incoming update is mirrored into a local SQLite database before the handler runs. https://github.com/GhostPawJS/telegram
- Eight tables, created by initTelegramTables(db): messages, users, chats, members, reactions, files, callbacks and bot state. https://github.com/GhostPawJS/telegram
- The message index is FTS5 with Unicode diacritic folding. https://github.com/GhostPawJS/telegram
- Four tools: tg_read, tg_send, tg_manage, tg_connect; tools return plans by default, and tools.createTelegramToolFacade({ client, execute: true }) executes with per-chat and global token buckets and retry_after handling. https://github.com/GhostPawJS/telegram
- The MCP server keeps messages in ~/.ghostpaw/telegram.db, executes sends only when TELEGRAM_BOT_TOKEN is set and does not poll for updates. https://github.com/GhostPawJS/telegram
- createBot accepts api: { fetch, apiRoot } for an injected fetch or a custom Bot API endpoint. https://github.com/GhostPawJS/telegram
- In the recorded run the handler found each message already stored, editHistory kept the pre-edit text, replyChain returned messages 10 and 11, a search for "cafe" found "café", and tg_send returned "Message ready to send". https://github.com/GhostPawJS/telegram#quick-start
- In the 0.6.2 run a search for \"finance\" found message 10 after the edit and messagesOut counted the handler's reply. createBot downloads incoming files in the background and stores them once per SHA-256 hash; DEFAULTS.autoDownload is deprecated and unused. https://github.com/GhostPawJS/telegram
- 883 tests with 97.92% line, 90.27% branch and 97.41% function coverage, measured 2026-10-24. https://github.com/GhostPawJS/telegram
- dist is 33.7 KB gzip and imports in about 9.1 ms on the maintainer box, measured 2026-10-24. https://github.com/GhostPawJS/telegram
- People log agent actions to a Telegram bot as an audit trail. V021 V030

## Axes
| Axis | Market | Voices | Chosen |
| --- | --- | --- | --- |
| Opening | "The Telegram Bot Framework", "Telegram Bot MCP Server" P001 P004 | wants the bot to remember the chat V059 V035 | open on memory: every update in SQLite first |
| Proof | API docs and method coverage P003 P002 | wants a log of what happened V021 V030 | a replayed run with real rows, edit history and a plan |
| Mechanism | framework with middleware, or MCP wrapper over the Bot API P001 P003 | builds SQLite memory by hand V059 V056 | mirror before handler, read surface, plan-first tools |
| Palette | white docs and GitHub pages P001 P005 P008 | terminal users running agents on a VPS V024 V006 | near-black void, spectral cyan for stored rows, wraith violet for edits and replies, ward green for plans |
| Imagery | logos and mascots P001 P002 | chats piling into a local store V056 V059 | generated line art: a cyan paper plane looping into a database cylinder with a paw on its lid |
| Tone | "powered by obsession", "Integrate with 2,000+ apps" P001 P007 | plain fixes and runbooks V025 V026 | plain, says what is stored and what needs a token |

## Sparks
- "Sending every important action to a Telegram bot is a cheap audit trail." V021 V030
- A message becomes a proposal, a button executes it. V030 V021
- The bot that stays silent because nobody is on the allowlist. V026 V025
- Memory in SQLite, built by hand every time. V059 V035

## Directions
1. Framework page: middleware chains and plugins. V046 → struck: first direction; it is grammY's page (P001).
  pushed: none.
2. Chat bubbles: a phone mockup with the bot talking. V051 → struck: shows a messenger, not what is stored.
  pushed: messages appear as rows in the state pane.
3. Mirror first: every update in SQLite before the handler; a run shows edit history, a reply chain, search and a plan-only send. V059 V035 V030 → chosen
  pushed: the state pane counts outbound calls, and the plan step leaves it at one.
4. Audit trail page: the bot as a log of agent actions. V021 → struck: one use, not the library.
  pushed: mentioned in the worry section.
5. Moderation console: ban, restrict, promote. V053 V057 → struck: tg_manage is one of four tools.
  pushed: listed in the explainer.
6. Privacy defence of Telegram. V041 V044 → struck: not the library's to defend.
  pushed: the worry section says what the mirror stores locally.
7. Rate-limit page: token buckets and retry_after. V033 → struck: a detail.
  pushed: one worry item.
8. Plain README page. V047 → struck: market baseline (P003 P008).
  pushed: README one click away.

## Concept
Mirror first. The page leads with what the voices build by hand (V059 V035): a record of the chat. The run starts a real bot with long polling against a local stand-in for the Bot API, so three updates arrive in a group; the handler finds each message already in SQLite, an edit keeps the old text, a reply builds a chain, search for "cafe" finds "café", and the agent's send comes back as a plan that nobody executed (V030 V021).

## Spine
1. Hero: "Your bot remembers the chat. Including what was edited." Subline: every update in SQLite before your handler, FTS5 search, plan-first agent tools; install and MCP lines; readout; plane-and-cylinder art. V059 V035
2. The run: one group, three updates, six replayed steps. V030 V021
3. Explainer: what the mirror keeps and the four tools. V056 V046
4. Worry: what needs a token, rate limits, what is stored. V026 V033
5. Numbers: 0 deps, Node 24+, 883 tests, 97.9% lines, 33.7 KB gzip, about 9.1 ms import, 4 tools.
6. Start: install, quick start, GitHub, README, home and siblings.
7. Footer: Impressum, Datenschutz.

## Palette
| Role | Color | Source |
| --- | --- | --- |
| void | #04070b | the shared GhostPaw night; bot docs are white P001 P005 |
| panel | #0a1119 | the mirror pane and step panes |
| rule | #1d2c3c | borders and HUD grid |
| ghost | #e3edf5 | body text |
| haze | #93a5b9 | secondary text |
| spectral | #62e6f2 | stored rows and actions |
| wraith | #b39dff | edits and replies |
| alarm | #ff7aa6 | refusals |
| ward | #7af0b4 | plans and success |

## Type
| Role | Family | Source |
| --- | --- | --- |
| display | Tektur, Bahnschrift, Arial Narrow, sans-serif | the shared GhostPaw HUD face |
| body | system-ui, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif | the reader's own sans |
| code | Martian Mono, Cascadia Mono, Consolas, monospace | rows, calls and tool results |

## Form
Shared panes with chamfer and lit top bar; the mirror pane lists messages, edits kept, outbound calls, last read and last tool result. Steps with call and result. One column on phones; desktop keeps the pane beside the steps. Plain void ground with one faint cyan glow.

## Imagery
| Image | Job | Art direction | Source |
| --- | --- | --- | --- |
| hero vault | protagonist | a wireframe paper plane in cyan light, a violet dotted orbit leading into a stacked database cylinder with a glowing paw on its lid; no text V059 V056 | generated |
| chain | explanation | cyan speech bubbles stacking down into a band of stored lines, with a violet magnifier over them; search over the mirror V045 | generated |
| share card | share preview | the hero art with the headline at 1200×630 | generated art, rendered from HTML |

## Motion
Moment: one cyan scan line sweeps the hero art once on load (900 ms).
Feedback: run steps reveal results.
Reduced motion: no sweep or flash.

## Copy
- Use: "remembers", "audit trail", "allowlist" in the voices' plain sense V035 V021 V026
- Show tool names, tables and environment variables as code. V026
- Avoid: "The Telegram Bot Framework", "powered by obsession", "2,000+ apps" P001 P007
- Avoid: "files downloaded eagerly" as a headline; the stand-in run sent no files, so the page states only what the source does with files. V045
- Plain second person; say the Bot API was a stand-in. V005
- Never present voices as customers. V013

## Changelog
- 2026-10-24: first concept from the 2026-10-24 research batch (61 voices, 12 peers); mirror first chosen; replay of a real telegram 0.6.0 run against a local Bot API stand-in. Eager file download and search after edits left off the page: in the run DEFAULTS.autoDownload was false and the search index kept the pre-edit text.
- 2026-10-24: depth pass (10 more voices, now 71); replay re-run against the current release; import time re-measured; comparison section added; page moved to https://telegram.ghostpaw.dev/.
- 2026-10-24: telegram 0.6.2 released (search follows edits, allowedChatIds filters chats, sent messages mirrored and counted). Replay re-run against 0.6.2; the search step and the notes now show the edited text in the index, the worry list names allowedChatIds, and the files line says background download from bot.ts. Tests 887, 34.2 KB gzip.
- 2026-10-24: portal chrome pass. Shared top bar (GhostPaw/<lib>, Live demo or Docs, GitHub, npm), version badge, footer row of all seven libraries; sibling links row dropped from the start section; the ruled grid on the page ground was replaced by one radial glow (lfm 0.1.9 rejects ruled ground textures); share card relabelled GhostPaw/<lib> with the install line.
