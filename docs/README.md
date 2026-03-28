# @ghostpaw/telegram — Documentation

Operator and implementer manual.

## Manuals

- [HUMAN.md](HUMAN.md) — direct-code usage: init, read, write, network, render
- [LLM.md](LLM.md) — agent builder guide: soul, tools, skills

## Entity References

- [MESSAGES.md](entities/MESSAGES.md)
- [USERS.md](entities/USERS.md)
- [CHATS.md](entities/CHATS.md)
- [MEMBERS.md](entities/MEMBERS.md)
- [REACTIONS.md](entities/REACTIONS.md)
- [FILES.md](entities/FILES.md)
- [CALLBACKS.md](entities/CALLBACKS.md)

## Core Separations

| Layer | Purpose |
|---|---|
| `read` | Query the local SQLite mirror |
| `write` | Send messages and actions via grammy |
| `network` | Manage polling/webhook lifecycle |
| `render` | Pure markdown and text transformation |
| `tools` + `skills` | Agent-facing JSON-schema tools and workflow playbooks |
| `soul` | Herald persona for the system prompt |

The `read` surface never calls the Telegram API. The `write` surface never queries the database. `network` manages the grammy transport lifecycle. `render` is pure — no I/O.
