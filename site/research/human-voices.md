# Human voices: GhostPaw Telegram

## Batch 2026-10-24 · from zero · queries: "telegram bot AI agent", "telegram bot history messages", "telegram bot API rate limit", "openclaw telegram", "telegram MCP", "grammy telegram bot", "telegram bot", "telegram bot api", "telegram privacy bot (Lemmy, disagreement)", "telegram bot message history sqlite (GitHub)", "telegram 429 retry_after bot (GitHub)" · unreachable: YouTube (429 Too Many Requests, then redirect to a sorry page), Reddit (challenge page), Mastodon (search needs login)

### V001 · Hacker News (Apple Says Mac Studio and Mac Mini Will Be in Short Supply for Months) · buyer · posted 2026-05-01 · fetched 2026-10-24 · via fetch
> As I play more with Agents like Hermes and Openclaw I've come to realise these truly are the new GUI.
>
> I have Radarr and Sonarr running on my homeserver. I switched my model to cloud Claude, pasted the API docs of said apps and told it to make 'search, add, remove, update, and statusupdate' available in a small MCP.
>
> It took 7 minutes, I switched back to my local Qwen3.6 model and I haven't touched the webinterface of Radarr and Sonarr in weeks. I just ask the model.
>
> Everyone now gets a chat with my (telegram) AI bot in stead of relaying requests through me.
>
> I have been looking into a decent local device. DGX Spark, Mac Studio etc... …
<https://news.ycombinator.com/item?id=47972508>

### V002 · Hacker News (OpenClaw’s memory is unreliable, and you don’t know when it will break) · adjacent · posted 2026-04-11 · fetched 2026-10-24 · via fetch
> Expose the API to the outside world using tailscale. Run your telegram bot on n8n or windmill.dev. You can absolutely use an LLM, both n8n and windmill.dev support AI agentic workflows. google "n8n LLM telegram bot" and you'll find tons of examples.
<https://news.ycombinator.com/item?id=47728496>

### V003 · Hacker News (Ask HN: Is anybody getting value from AI Agents? How so?) · creator · posted 2024-03-31 · fetched 2026-10-24 · via fetch
> Not sure if this would qualify has an "agent", but I developed my own AI personal assistant that runs as a telegram bot. I can use it from everywhere easily, handles my events, reminders, sends me a daily agenda and memorizes useful things for me. I even integrated it with whisper so that I can send a telegram voice message and don't need to write.
> From a product/selling perspective, no value at all since I haven't even considered that (I'm building it for myself and my needs). But daily usefulness value? heck yeah!
<https://news.ycombinator.com/item?id=39886676>

### V004 · Hacker News (Push events into a running session with channels) · buyer · posted 2026-03-20 · fetched 2026-10-24 · via fetch
> I’ve been using Telegram for about 10 years, and it’s one of the few products that has consistently felt great the entire time. It’s fast everywhere: backend, mobile app, desktop app, all of it. Everything just works. Its sync is out of this world—fluid, fast, and seamless across devices. You can use it on your phone, then move to your PC or laptop and continue instantly without friction. Unlimited message history and file storage are fantastic, and the bot platform is absurdly powerful. It’s boring in the best way, which is exactly what you want from a channel for interacting with your agents everywhere.
<https://news.ycombinator.com/item?id=47449470>

### V005 · Hacker News (Show HN: cursor-tg – Run Cursor Cloud Agents from Telegram) · adjacent · posted 2026-03-10 · fetched 2026-10-24 · via fetch
> Good idea for async coding workflows. One surface worth hardening: the Telegram input is the agent's stdin. Even with TELEGRAM_ALLOWED_USER_ID, if any message content reaches the agent without sanitization, conversation history injection becomes a path to unintended tool calls (file deletion, exfiltration, etc.). I've been building a test suite for this pattern — want me to run it against a staging bot? Full report, no charge.
<https://news.ycombinator.com/item?id=47318399>

### V006 · Hacker News (Setting up OpenClaw on a cloud VM) · buyer · posted 2026-02-27 · fetched 2026-10-24 · via fetch
> I recently installed Zeroclaw instead of OpenClaw on a new VPS(It seems a little safer). It wasn’t as straightforward as OpenClaw, but it was easy to setup. I added skills that call endpoints and also cron jobs to trigger recurrent skills. The endpoints are hosted on a separate VPS running FastAPI (Hetzner, ~$12/month for two vps).
>
> I’m assuming the claw might eventually be compromised. If that happens, the damage is limited: they could steal the GLM coding API key (which has a fixed monthly cost, so no risk of huge bills), spam the endpoints (which are rate-limited), or access a Telegram bot I use specifically for this project
<https://news.ycombinator.com/item?id=47184696>

### V007 · Hacker News (OpenClaw’s memory is unreliable, and you don’t know when it will break) · buyer · posted 2026-04-10 · fetched 2026-10-24 · via fetch
> > You can use anything to call this API right?
>
> The API is on my home PC and not exposed to the outside world. Only OpenClaw via Telegram was. So my question is about the infrastructure:
>
> How do I communicate with something at home (it could be the API directly) using a messaging app like Telegram? I definitely want an LLM in the mix. I want to casually tell it what my TODO is, and have it:
>
> - Craft it into a concise TODO headline
>
> - Craft a detailed summary
>
> - Call the API with the above two.
>
> I'm not asking in the abstract. What specific tools/technologies should I use?
<https://news.ycombinator.com/item?id=47724264>

### V008 · Hacker News (OpenClaw is a security nightmare dressed up as a daydream) · buyer · posted 2026-03-22 · fetched 2026-10-24 · via fetch
> What are the pros of using openclaw?
>
> Using telegram? Being able to automatically create calendar events based on emails?
<https://news.ycombinator.com/item?id=47483105>

### V009 · Hacker News (OpenClaw is changing my life) · adjacent · posted 2026-02-08 · fetched 2026-10-24 · via fetch
> I admire the people that can live happily in the ignorance of what’s under the hood, in this case not even under the layer of claude code because that was too much aparently so people are now putting openclaw+telegram on top of that.
>
> And me ruining my day fighting with a million hooks, specs and custom linters micromanaging Claude Code in the pursuit of beautiful code.
<https://news.ycombinator.com/item?id=46932175>

### V010 · Hacker News (Show HN: Three new Kitten TTS models – smallest less than 25MB) · buyer · posted 2026-03-19 · fetched 2026-10-24 · via fetch
> I'm still looking for the "perfect" setup in order to clone my voice and use it locally to send voice replies in telegram via openclaw. Does anyone have auch a setup?
>
> I want to be my own personal assistant...
>
> EDIT: I can provide it a RTX 3080ti.
<https://news.ycombinator.com/item?id=47443609>

### V011 · Hacker News (Hey Siri, Make Me a Million Dollars) · creator · posted 2026-03-08 · fetched 2026-10-24 · via fetch
> Voice-controlled OpenClaw: Siri → Shortcut → Telegram → bot on a Hetzner server appends to idea-log.md. Two bots, two days to build. Runbook with phases, scripts, and fixes.
<https://news.ycombinator.com/item?id=47302186>

### V012 · Hacker News (Ask HN: Are you using OpenClaw or similar agents? How?) · buyer · posted 2026-03-23 · fetched 2026-10-24 · via fetch
> I'm using it to manage product backend operations through Telegram. Without OpenClaw, most tasks were automatable with Claude Code anyways, but OpenClaw lets me to chat in TG and get things done without opening up a terminal.
>
> I also built a tax filing engine that handles my tax locally (demo: https://x.com/artoriatech/status/2036111002790490365 web: https://oktax.app)
>
> As for security, I don't run OpenClaw on my machine, but I use a VPS and let Claude Code do security reviews regularly, and enforce OpenClaw to ask for confirmation every time it runs critical scripts or delete files.
<https://news.ycombinator.com/item?id=47492091>

### V013 · Hacker News (My Experience Using OpenClaw: A Security Professional's Journey) · buyer · posted 2026-02-13 · fetched 2026-10-24 · via fetch
> > Telegram became my main interface to AgentX (my OpenClaw agent). Why Telegram?
>
> > Secure (end-to-end encryption available)
>
> It seems telegram bot conversations don't use the Secret Chat feature [1]. Even if they did, I'd be cautious [2].
>
> [1] https://community.latenode.com/t/are-telegram-bot-conversations-protected-with-end-to-end-encryption/23991
>
> [2] https://blog.cryptographyengineering.com/2024/08/25/telegram-is-not-really-an-encrypted-messaging-app/
<https://news.ycombinator.com/item?id=47007448>

### V014 · Hacker News (Show HN: Tolaria – Open-source macOS app to manage Markdown knowledge bases) · buyer · posted 2026-04-24 · fetched 2026-10-24 · via fetch
> I actually largely solved this with OpenClaw — i send stuff via telegram and it creates good notes in Tolaria, already linked to what exists and what's relevant
>
> I send web links of tools that I want to store of resources, voice notes to be turned into written notes, etc
>
> but I will still build a mobile version for sure!
<https://news.ycombinator.com/item?id=47888180>

### V015 · Hacker News (Ask HN: Who is using OpenClaw?) · buyer · posted 2026-04-15 · fetched 2026-10-24 · via fetch
> Telegram -> 1 Group/agent -> OpenClaw running on an old laptop
>
> Using it for journaling and capturing ideas. Previous workflow as iPhone Memos. Now it's
>
> voice message -> openclaw -> transcribe using parakeet -> git repo
<https://news.ycombinator.com/item?id=47785412>

### V016 · Hacker News (OpenClaw 2.0, Accidentally) · buyer · posted 2026-08-31 · fetched 2026-10-24 · via fetch
> Re Signal, I've taken a few flights lately where there's messenger-only wifi, and it's been handy to have OpenClaw on a box accessible through telegram to do web_searches for me.
>
> That's certainly not justification for setting it up in the first place, but is a mildly useful benefit of having done so.
<https://news.ycombinator.com/item?id=49506358>

### V017 · Hacker News (Sign up, get a running AI agent in 60 seconds) · buyer · posted 2026-03-16 · fetched 2026-10-24 · via fetch
> I've been running OpenClaw for personal use (WhatsApp agent, Telegram bot for work stuff) and got tired of managing the VPS, keeping it updated, fixing gateway crashes at 3am, etc.
>
> So I built Silos — a managed platform that gives you a dedicated OpenClaw instance with one click. You sign up, pick a plan, and get:
>
> - A VPS with OpenClaw running and channels ready (WhatsApp, Telegram, Discord, Slack)
> - The Silos dashboard to manage agents, sessions, and channels
> - The full OpenClaw Control UI for deep config (skills, brain, tools)
> - AI inference included in the price (via CheapestInference) — no per-token billing
>
> Plans start at $9/mo (bot only, bring your own AI) or $29/mo with AI included. …
<https://news.ycombinator.com/item?id=47402047>

### V018 · Hacker News (Sonnet 5.5) · adjacent · posted 2026-09-28 · fetched 2026-10-24 · via fetch
> FWIW, Claude Channels[1][2] are probably going to be the solution for that, eventually. While I'm not sure how the WebHook receiver example will work with, say, GitHub and a local Claude, the Chat side of things _would_. So you'd have GH send its web hook to Telegram (for example), and then the Telegram Channel MCP would inject that into Claude, and Claude would start working on the problem. Still experimental, but functional enough to play with.
>
> [1]: https://code.claude.com/docs/en/channels
> [2]: https://code.claude.com/docs/en/channels-reference
<https://news.ycombinator.com/item?id=49884448>

### V019 · Hacker News (Ask HN: MCP Native Tools?) · adjacent · posted 2026-07-10 · fetched 2026-10-24 · via fetch
> native mcp tools are the way to go - frontend is essentially dead.
>
> The future is you having an OpenClaw/Hermes agent connected to these native MCPs and you texting on telegram/whatsapp etc.. with your agent to get information.
>
> I'm already doing this - the future is now!!
<https://news.ycombinator.com/item?id=48855849>

### V020 · Hacker News (Stdio MCP Tunnels: Connecting Mobile/Cloud Agents to iMsg/WhatsApp/Linkedin) · adjacent · posted 2026-08-27 · fetched 2026-10-24 · via fetch
> Many members of our team were users of Beeper, a "unified inbox" for chat networks like WhatsApp, Telegram, iMessage, Slack, LinkedIn DMs, etc, and wanted to expose this to our agents. However, we quickly ran into the issue where the Beeper MCP server requires the Beeper desktop app running locally and cannot connect via cloud agents.
>
> This meant that any cloud/mobile agents (like Claude.ai, ChatGPT, Devin) not running on our laptops/devices with Beeper desktop installed could not access the Beeper MCP. …
<https://news.ycombinator.com/item?id=49465668>

### V021 · X (post) · adjacent · posted 2026-10-08 · fetched 2026-10-24 · via connector
> @eliana_jordan Sending every important action to a Telegram bot is a cheap audit trail. Do you rate-limit the alerts so a card-testing burst does not bury the real ones?
<https://x.com/proxy_vector/status/2108106019142500711>

### V022 · X (post) · adjacent · posted 2026-10-11 · fetched 2026-10-24 · via connector
> @trvsco @openclaw Calling it extended-stable and then telling you to rerun onboarding is rough.
>
> That kind of week is what pushed me off OpenClaw. I built my own: the real Claude Code doing the work on a server that's mine, each agent reached through its own Telegram bot.
>
> Updates there go in
<https://x.com/sav_gpt/status/2109293261613416551>

### V023 · X (post) · buyer · posted 2026-10-05 · fetched 2026-10-24 · via connector
> i dont think i need hermes agent anymore as its bloated asf on my vm rn
>
> i can just glue together all use pi durable with
> - my customized memory plugin 
> - camofox localhost rest api on my vm (for stealth browser use)
> - my existing sandbox, packages, and modules fully managed
<https://x.com/0xrsydn/status/2106977073890013362>
Observer note: 25 likes at fetch

### V024 · X (post) · buyer · posted 2026-10-23 · fetched 2026-10-24 · via connector
> @jackyang886 My country isn't banned by Claude, but I rent a $5 VPS (Contabo) in Germany to use as a coding server and control it via OpenClaw (Telegram bot). You can try this method if you're blocked.
<https://x.com/DavidTo7yxs/status/2113578268356210766>

### V025 · X (post) · creator · posted 2026-10-11 · fetched 2026-10-24 · via connector
> Hermes Agent Telegram bot only replies while your SSH session is open?
>
> The gateway dies with your shell.
> 1) hermes gateway install
> 2) loginctl enable-linger $USER
> 3) Log out, DM the bot again
>
> OpenClaw / Hermes Agent / DeepSeek Harness / OpenCode: https://t.co/9ZqYgFldFv https://t.co/M5ZPjb7WZD
<https://x.com/JayQinQT/status/2109367983646908911>

### V026 · X (post) · creator · posted 2026-10-12 · fetched 2026-10-24 · via connector
> Hermes Agent Telegram bot online but never replies?
>
> Likely no allowlist: the gateway ignores unknown users. Add to ~/.hermes/.env:
> TELEGRAM_ALLOWED_USERS=your_numeric_id
> Restart hermes gateway.
>
> OpenClaw / Hermes Agent / DeepSeek Harness / OpenCode: https://t.co/9ZqYgFldFv https://t.co/BjhiG2bEzr
<https://x.com/JayQinQT/status/2109791366511563231>

### V027 · X (post) · buyer · posted 2026-10-09 · fetched 2026-10-24 · via connector
> @DaveShapi My stack looks boring next to this: Claude Code for shipping, a Telegram bot as chief of staff, and a pile of serverless cron jobs nobody sees. The fancy agent name matters less than having one that doesn't silently break at 2am.
<https://x.com/luke_jarocki/status/2108667069986476342>

### V028 · X (post) · buyer · posted 2026-10-10 · fetched 2026-10-24 · via connector
> @aygiyd @openclaw @steipete Internal monitor text landing in a user's chat is the worst kind of timeout.
>
> I hit enough of those that I built my own: Claude Code on a server of my own, each agent its own Telegram bot.
>
> Since then I haven't had to debug a chat once; whatever went wrong fixed itself.
>
> Was that
<https://x.com/sav_gpt/status/2108923701081063891>

### V029 · X (post) · buyer · posted 2026-10-19 · fetched 2026-10-24 · via connector
> @julianschubert @willbakerships for an openclaw style bot it's a telegram bot token plus the model key, and that second part is where people stall. there's a walkthrough at https://t.co/w4l70ULF5r, and support will do the pairing step with you
<https://x.com/dougame841114/status/2112046337164468658>

### V030 · GitHub (WoodenZombie/cadence issue #18) · creator · posted 2026-10-22 · fetched 2026-10-24 · via fetch
> A message becomes a proposal, a button executes it, and everything is logged.
>
> - [ ] #10 E1-1 Telegram bot skeleton with an allowlist of your Telegram user ID
> - [ ] #11 E1-2 SQLite schema and migrations (action log, pending actions)
> - [ ] #12 E1-3 LLM layer: interface plus one cloud adapter (complete, complete_structured, tool_call)
> - [ ] #13 E1-4 Action proposal schema (type, parameters, target system) validated with Pydantic
> - [ ] #14 E1-5 Confirmation flow: Yes / Edit / Cancel buttons, proposal ID, expiry, idempotent execution
> - [ ] #15 E1-6 Intent routing: calendar vs task vs expense vs inbox; ask one question when unsure
> - [ ] #16 E1-7 Action log and a /history command
> - [ ] #17 E1-8 Te …
<https://github.com/WoodenZombie/cadence/issues/18>
Observer note: issue title: E1 Epic: Core bot and confirmation flow

### V031 · GitHub (YuzeHao2023/Awesome-MCP-Servers issue #587) · brand · posted 2026-10-07 · fetched 2026-10-24 · via fetch
> ## Summary
>
> ```diff
>  Category: Communication
> + Teleloom — local Telegram MCP: multiple accounts/bot profiles, search, sourced digests, media and previewed actions.
> ```
>
> I am the author of [Teleloom](https://github.com/starsinc1708/teleloom); this submission was prepared with AI assistance. Adds one entry following the category's existing name/URL format.
>
> ## Evidence
>
> - **Before:** no Teleloom repository URL in README; GitHub issue/PR searches found no previous Teleloom suggestions on 2026-10-07.
>   **After:** checked the prepared diff: README.md +1/-0, one Teleloom GitHub URL in Communication. Existing entries are preserved.
> - Description checked against the public project README. …
<https://github.com/YuzeHao2023/Awesome-MCP-Servers/pull/587>
Observer note: issue title: Add Teleloom Telegram MCP server

### V032 · GitHub (punkpeye/awesome-mcp-servers issue #17280) · brand · posted 2026-10-22 · fetched 2026-10-24 · via fetch
> Adds cyuanxv/telegram-bot-mcp-server under Communication, in alphabetical order.
>
> The project is MIT-licensed and self-hosted, with public source and the npm package @cyuanxv/telegram-bot-mcp-server@1.0.0. It supports rich text, media, message editing, and interactive buttons using the user's own Telegram Bot credentials and authenticated Streamable HTTP. The tag follows this list's Cloud definition because the server calls the remote Telegram Bot API; macOS and Linux installation have been checked.
>
> Validation: one README entry, correct owner/repo link, no duplicate repository entry, permitted language/platform tags, and git diff --check passed. …
<https://github.com/punkpeye/awesome-mcp-servers/pull/17280>
Observer note: issue title: Add cyuanxv/telegram-bot-mcp-server to Communication 🤖🤖🤖

### V033 · GitHub (Growth-Circle/cadis issue #4377) · buyer · posted 2026-10-05 · fetched 2026-10-24 · via fetch
> ## Problem\nAll API methods (get_updates, send_message, etc.) have no rate limiting, no exponential backoff, no Retry-After header handling.\n\n## Actual Output\nTelegram API returns 429 Too Many Requests → bot banned.\n\n## How to Fix\nImplement token bucket rate limiter + respect Retry-After on 429:\n\n```rust\nif response.status() == 429 {\n  let retry_after = response.headers().get("retry-after")\n    .and_then(|v| v.to_str().ok())\n    .and_then(|s| s.parse::<u64>().ok())\n    .unwrap_or(60);\n  tokio::time::sleep(Duration::from_secs(retry_after)).await;\n}\n```\n\n## Expected Output\nGraceful backoff on rate limits.\n\n## Critical Level\nHigh - service disruption\n\n## My Confidence\nH …
<https://github.com/Growth-Circle/cadis/issues/4377>
Observer note: issue title: feat(telegram): implement rate limiting with 429 retry-after

### V034 · GitHub (chatmcp/mcpso issue #5602) · brand · posted 2026-10-17 · fetched 2026-10-24 · via fetch
> **Name:** Retensy Bots MCP
> **Type:** MCP Server (local, stdio)
> **Repository:** https://github.com/retensy/retensy-mcp
> **Website:** https://bots.retensy.com/bots
> **npm:** @retensy/mcp
> **License:** MIT
>
> **Description:** Build and publish Telegram and MAX bot funnels, broadcasts, AI agents with a knowledge base, block-based sites and blog articles in Retensy Bots from Claude Desktop/Code, Cursor or any MCP client. …
<https://github.com/chatmcp/mcpso/issues/5602>
Observer note: issue title: Submit MCP Server: Retensy Bots MCP (@retensy/mcp)

### V035 · DEV (comment on "Telegram Bridges for Gemini CLI and Codex After Hitting Claude Code Li") · buyer · posted 2026-03-29 · fetched 2026-10-24 · via fetch
> Really resonated with the "wasted tokens" point about session continuity. That's such an underrated problem — you lose context, reset, and end up burning through your quota even faster.
>
> One thing that helped me with the usage limit awareness problem (before I even hit the wall) was running a little macOS menu bar app called TokenBar. It sits in your menu bar and tracks token usage across Claude, OpenAI, etc. in real-time. Costs $5 one-time. Having that live counter visible actually changed my prompting behavior — I started being more deliberate with context windows because I could see the tokens adding up. …
<https://dev.to/godnick/comment/3663d>

### V036 · DEV (comment on "Telegram Bridges for Gemini CLI and Codex After Hitting Claude Code Li") · buyer · posted 2026-03-29 · fetched 2026-10-24 · via fetch
> The rate limit problem is real — and bridging CLI tools through Telegram is a smart workaround for async workflows. You're essentially turning a synchronous CLI into an event-driven system.
>
> Curious: do you find that the model-switching (Claude → Gemini → Codex) based on availability produces consistent enough results for your workflow? Or do you route specific task types to specific models?
<https://dev.to/mads_hansen_27b33ebfee4c9/comment/3664f>

### V037 · DEV (comment on "Telegram Bridges for Gemini CLI and Codex After Hitting Claude Code Li") · creator · posted 2026-04-07 · fetched 2026-10-24 · via fetch
> Nice approach with Telegram bridges! I took a different route and built a dedicated mobile app (CodeVibe) that connects to Codex, Claude Code, and Gemini CLI. Main differences: push notifications for approvals, full file diff preview with syntax highlighting, and E2E encryption.
>
> Free tier, one-command setup: curl -fsSL https://quantiya.ai/codevibe/install.sh | bash
>
> https://quantiya.ai/codevibe
<https://dev.to/hendry_yeh_61c4bfe69c1849/comment/36g0g>

### V038 · DEV (comment on "Telegram Bridges for Gemini CLI and Codex After Hitting Claude Code Li") · adjacent · posted 2026-05-21 · fetched 2026-10-24 · via fetch
> The session continuity section is the core. A bridge that only relays text is a demo; a bridge that can safely continue the same local coding session is the product.
>
> I am building Faryo on the tmux side of that idea: https://github.com/Snailflyer/faryo. The phone/browser is not the agent runtime; it is the compact control surface over the host session.
<https://dev.to/snailflyer/comment/38855>

### V039 · DEV (comment on "🚀 Meet Telelinker: A CLI Tool to Extract and Analyze Links from Telegr") · adjacent · posted 2025-11-09 · fetched 2026-10-24 · via fetch
> Fascinating tool, César. Telelinker elegantly addresses a non-trivial challenge in ephemeral data extraction from Telegram’s API-constrained environment, where rate limits and message pagination often deter systematic analysis. By leveraging the Telethon client under a CLI abstraction, you’ve democratized link intelligence for researchers studying information diffusion in closed groups—think misinformation tracking or influence network mapping. The inclusion of domain frequency histograms and export to CSV/JSON transforms raw hyperlinks into actionable metadata for downstream NLP pipelines (e.g., integrating with Hugging Face models for content classification). …
<https://dev.to/jefferson_rosas/comment/329db>

### V040 · Lemmy (comment on "ZeroTrust Your Home" [selfhosted]) · adjacent · posted 2024-09-07 · fetched 2026-10-24 · via fetch
> Zero trust, but you have to use Amazon AWS, Cloudflare, and make your own Telegram bot? And have the domain itself managed by Cloudflare.
>
> Sounds like a lot of trust right there... Would love to be proven wrong.
<https://lemmy.world/comment/12227467>
Observer note: score 87 at fetch

### V041 · Lemmy (comment on "Chat Apps, Government Ties, and Transparency – Threema" [privacy]) · adjacent · posted 2024-05-14 · fetched 2026-10-24 · via fetch
> I still stand with **Signal App**. 
> * Telegram has no default E2EE. 
> * [Threema's encryption was compromised ](https://www.bleepingcomputer.com/news/security/threema-claims-encryption-flaws-never-had-a-real-world-impact/). 
> * Threema & Telegram both are **for profit** companies. 
> * Signal is non-profit & all their source code + finances are public. Even their server codes are publically available
<https://lemmy.world/comment/10041489>
Observer note: score 71 at fetch

### V042 · Lemmy (comment on "Why do most people choose to use WhatsApp over telegram??" [asklemmy]) · buyer · posted 2023-08-20 · fetched 2026-10-24 · via fetch
> I don't understand the love for Telegram. 
>
> In the short period of using it I had so much BS come through by scammers/spammers - both as DMs and group messages.  I've rarely had that with WhatsApp.  
>
> In my eyes WhatsApp is far better than Telegram.  And Signal is far greater than WhatsApp. The only thing I wish Signal had was inbuilt GIFs; it's not that much of an issue on mobile but it's a pain on desktop.
<https://lemmy.world/comment/2593502>
Observer note: score 68 at fetch

### V043 · Lemmy (comment on "*Permanently Deleted*" [technology]) · adjacent · posted 2025-05-29 · fetched 2026-10-24 · via fetch
> Telegram ASTOUNDS me.
>
> Like, there's been several instances of them outwardly admitting that their security sucks, not to use it for encrypted chats, that they just give logs away to world governments, *and yet* thousands of crypto bros and bots use telegram to function, EVEN ZLIBRARY, who could just as easily set up and use Matrix, has a Telegram bot for downloading books.
<https://lemmy.world/comment/17337350>
Observer note: score 63 at fetch

### V044 · Lemmy (comment on "The Privacy Iceberg" [privacy]) · adjacent · posted 2025-05-07 · fetched 2026-10-24 · via fetch
> I have no clue why telegram is often mentioned when it comes to "privacy focused messaging". They don't even have e2e encrypted group chats. Only 1:1 chats may be encrypted as an opt-in. Even WhatsApp is more secure than that, since they use signals encryption.
>
> Also the "we don't give out even a byte of data to anyone" statements made by telegram have been thoroughly debunked as lies. When telegrams bottom line is in danger, they have and will give out your data.
<https://lemmy.world/comment/16905850>
Observer note: score 63 at fetch

### V045 · Lemmy (comment on "Telegram will disclose users' IP adresses and phone numbers to authori" [privacy]) · adjacent · posted 2024-09-23 · fetched 2026-10-24 · via fetch
> Sorry, should've provided the whole post:
>
> ::: spoiler Spoiler
>
> > 🔎 Search on Telegram is more powerful than in other messaging apps because it allows users to find public channels and bots. Unfortunately, this feature has been abused by people who violated our Terms of Service to sell illegal goods.  
> > 💪 Over the last few weeks, a dedicated team of moderators, leveraging AI, has made Telegram Search much safer. All the problematic content we identified in Search is no longer accessible. If you still manage to find something unsafe or illegal in Telegram Search, please report it to us via @SearchReport. …
<https://lemmy.world/comment/12518663>
Observer note: score 42 at fetch

### V046 · Lemmy (comment on "Umm I think I'll just delete you instead" [mildlyinfuriating]) · buyer · posted 2023-07-28 · fetched 2026-10-24 · via fetch
> Telegram is in every way better. My primary reason for prefering Telegram over anything else are **bots** (API specifically). I mean bots functionality is so awesome that I can't properly describe how awesome it is. <3
<https://lemmy.world/comment/1810809>
Observer note: score 35 at fetch

### V047 · Lemmy (comment on "*Permanently Deleted*" [technology]) · buyer · posted 2025-05-29 · fetched 2026-10-24 · via fetch
> Their bot api is very easy to use. I have made some telegram bots because is so easy. Tried to do the same with WhatsApp and didn't even get permission and api access. 
>
> Average Joes use mainstream things, if you want to do something accessible, these bots are the way. Ideally, you want them to download or use an app that does some hand holding. I'm all up to the fediverse but let's be honest, it has some non intuitive things for today's user, most were trained to understand and like centralized services. They vaguely understand and use emails today, and mostly for account creation of other platforms.
>
> Disclaimer: haven't tried to make signal bots, they are a thing?
<https://lemmy.world/comment/17343369>
Observer note: score 5 at fetch

### V048 · Lemmy (comment on "Hosting provider advice for a Telegram bot?" [selfhosted]) · adjacent · posted 2023-07-11 · fetched 2026-10-24 · via fetch
> Yes Telegram bot API supports long polling which is basically your server making successive long-running requests to the Telegram server and wait for a response.
<https://lemmy.world/comment/1115439>
Observer note: score 4 at fetch

### V049 · Lemmy (comment on "What are you using n8n for?" [selfhosted]) · buyer · posted 2025-12-10 · fetched 2026-10-24 · via fetch
> My most common use case is telegram integration via bot API - adding mobile controls to services that otherwise don't have acceptable (for me) UI. I've also tried their LLM integration and tool node to create a simple agent that reaponds directly to messages, but for now it can only save links to my linkwarden instance. I found it acceptable and plan to add more tools. Basically, i want it to automatically decide what to do with stuff that i send to chat.
>
> >I can't think of a use case, that couldn't be realized in Bash instead.  
>
> Well, everything can be done in bash (or in python, more probably), but n8n makes it easier to tweak. …
<https://lemmy.world/comment/20946052>
Observer note: score 1 at fetch

### V050 · Lemmy (comment on "Telegram is exposing their users privacy." [technology]) · adjacent · posted 2024-10-02 · fetched 2026-10-24 · via fetch
> Telegram users have never had privacy. Group chats are completely in the open and private messages are only encrypted if both users turn it on for each conversation—and it's off by default. I've never understood why anyone thinks Telegram is any better than posting anywhere else on the internet.
<https://lemmy.world/comment/12685139>
Observer note: score 33 at fetch

### V051 · Bluesky (post) · creator · posted 2026-10-23 · fetched 2026-10-24 · via fetch
> Day 240 of building Grape, an AI note taking app
>
> I'm working on a Telegram Bot.
>
> You'll be able to chat with Grape AI directly in Telegram. Create and read notes and do almost everything you can do in Grape's AI chat without leaving Telegram. It's very cool.
>
> #buildinpublic
<https://bsky.app/profile/ozgrozer.bsky.social/post/3mykwpi3e2k2c>
Observer note: 5 likes at fetch

### V052 · Bluesky (post) · brand · posted 2026-10-23 · fetched 2026-10-24 · via fetch
> 🤖 Telegram is testing a bot @agent that allows users to connect to AI services via API keys. The key will be stored on Telegram's servers. At this time, it is unknown whether its functionality will extend beyond that of a standard Telegram bot.
>
> #Telegram
<https://bsky.app/profile/gramnews.bsky.social/post/3mykbjp5lvw2r>

### V053 · Bluesky (post) · buyer · posted 2026-10-22 · fetched 2026-10-24 · via fetch
> The telegram bots have gotten bolder but they do not know I was forged in the fires of getting cold DMs from furries and they can’t get to me anymore
<https://bsky.app/profile/tigy.bsky.social/post/3myipudoz6k2x>
Observer note: 16 likes at fetch

### V054 · Bluesky (post) · creator · posted 2026-10-22 · fetched 2026-10-24 · via fetch
> So far about 140 people have used the bot (the only thing it logs is e.g. 'report: posted 14 programs' at the end of a session)
>
> I've been considering trying to remake it in Javascript and making a single offline webpage, for anyone who wouldn't wanna do it on telegram. Thoughts?
<https://bsky.app/profile/feilen.purr.church/post/3myijgyiqv22c>
Observer note: 7 likes at fetch

### V055 · Bluesky (post) · adjacent · posted 2026-09-17 · fetched 2026-10-24 · via fetch
> Bro why isn't your openclaw agent with telegram interface handling it....
<https://bsky.app/profile/qwertxzy.me/post/3mvqc4isd7s2t>
Observer note: 1 likes at fetch

### V056 · Bluesky (post) · creator · posted 2026-09-02 · fetched 2026-10-24 · via fetch
> 🤖 Thread per project, file for the long stuff: how I organize my OpenClaw agent home
>
> I've rebuilt my OpenClaw agent home three times now. Twice on Discord, once on Telegram. Disco...
>
> https://tinyurl.com/29zyzvvv #AINews #MachineLearning #CrustyTLDR
<https://bsky.app/profile/crustytldr.bsky.social/post/3muitqueyfa2u>

### V057 · Bluesky (post) · buyer · posted 2026-10-22 · fetched 2026-10-24 · via fetch
> Yes. My Telegram blew up last week or 2 with bot scammers complimenting my pfp, then sending me AI photos of attractive Asian women whose lifestyle I couldn't afford even if they were real.
<https://bsky.app/profile/odd-dimensions.bsky.social/post/3mygn73sbqc25>

### V058 · Bluesky (post) · creator · posted 2026-10-16 · fetched 2026-10-24 · via fetch
> I’m running The Stack on Telegram, a tiny daily feed of AI tools, full‑copy prompts, workflow steps or bot builds. Each post ends with a poll that decides what we cover next. No sign‑up, just one tap to leave.
>
> https://t.me/sbcthestack
<https://bsky.app/profile/sbcmedia.bsky.social/post/3mxzej4au3d2q>

### V059 · Bluesky (post) · creator · posted 2026-10-16 · fetched 2026-10-24 · via fetch
> Build your own AI Telegram bot in Python with persistent memory using SQLite and the free Gemini API. It even switches backup models automatically when rate limits hit. Step-by-step guide and code: https://procwire.com/blog/gemini-telegram-bot-python
<https://bsky.app/profile/autoflow.bsky.social/post/3mxzav3funs2d>

### V060 · Bluesky (post) · brand · posted 2026-10-13 · fetched 2026-10-24 · via fetch
> Telegram Bots to Get Usernames Ending in agent, ai, game, app, and gay for Premium Subscribers
>
> Instead of "bot," the name will be followed by "agent," "AI," or "game" — if the bot's name ends with the required letters and the owner has Premium.
<https://bsky.app/profile/gramnews.bsky.social/post/3mxrarln7sv2z>

### V061 · Bluesky (post) · creator · posted 2026-10-13 · fetched 2026-10-24 · via fetch
> I went on a bit of a side quest and built an API for my telegram channel manager bot.
<https://bsky.app/profile/henrick.thebull.app/post/3mxqmoe3dmc26>
