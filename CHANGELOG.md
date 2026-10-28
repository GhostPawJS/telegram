# Changelog

All notable changes are documented here using Keep a Changelog 1.1.0.

## [Unreleased]

## [0.7.6] - 2026-10-28

### Added

- Add `skill --short` with a compact CLI cheat sheet.

### Fixed

- List runnable guide commands in full CLI skill output and describe nested object and array parameters with complete table rows.

### Security

- Create CLI and MCP mirror databases and their SQLite sidecars with private POSIX permissions, and create containing directories with mode 0700. Preserve existing database and directory modes.

## [0.7.5] - 2026-10-28

### Security

- Validate remote media URL schemes, DNS answers and every redirect, block private targets by default, and pin connections to validated addresses to prevent DNS rebinding.
- Block NAT64 and 6to4 addresses that embed a private IPv4 address.
- Limit remote media downloads to 50 MiB, five redirects and a 30 second overall timeout by default. Add client size and timeout settings and explicit private URL opt-ins.

### Changed

- README and site add a labelled install line that also adds ~/.local/bin to ~/.profile, and a pinned line on the site.

## [0.7.4] - 2026-10-28

### Added

- Add `--version --short` and `--version --json` for machine-readable version output.
- Add `GHOSTPAW_NO_MODIFY_PATH=1` to skip persistent user PATH changes in the Windows installer.

## [0.7.3] - 2026-10-27

### Changed

- Make release binaries the default installation path and support explicit installer targets.
- Show the installation variant in human version output; retain plain machine versions.
- Include workflow guides, nested parameter rows and validated call examples in CLI skill output.
- Validate tool inputs before dispatch and include recovery shapes for invalid input.

## [0.7.2] - 2026-10-27

### Fixed

- The global flags `--json`, `--quiet`, `--compact` and `--no-color` also apply when they follow `--`, so `message send -- -100123 "hi" --json` prints JSON instead of failing with `Unexpected positional: --json`.
- Flag values that start with dashes are accepted; only a following `--name` token counts as the next flag.

## [0.7.1] - 2026-10-27

### Fixed

- CLI commands accept a negative chat ID, as used by groups, supergroups and channels, as a positional argument instead of failing with `Unknown flag`.
- `bot state` without `--key` reports the missing key instead of `No state stored for key: undefined`.

## [0.7.0] - 2026-10-27

### Added

- 27 noun-verb commands: bot stats/state/chats; mirror message/messages/search/chat/chats/user/users/reactions/replies/edits; message send/edit/delete/pin/unpin/typing/forward; member ban/unban/restrict/promote/kick/show/list. Noun-verb send and moderation commands return plans even when credentials are present.
- Schema-driven CLI flags, stdin JSON, per-command help, bash/zsh/fish completions, JSON and quiet output, and exit codes 0/1/2/3/4/70. Existing CLI forms retain their behavior.
- Standalone binaries for linux-x64, linux-arm64, darwin-arm64, darwin-x64 and windows-x64, with SHA256SUMS and build provenance attestations. Binaries are unsigned; macOS builds carry an ad-hoc signature.
- install.sh and install.ps1 refuse checksum mismatches. Release installation checks run on ubuntu-24.04, macos-15 and windows-2025 using offline mirror reads and MCP discovery; a public TLS handshake runs only in the install workflow.

### Changed

- SurfaceTool accepts optional `cli` command metadata. CLI and standalone binaries share Telegram options. Local reads and plans need no token; existing execution forms use TELEGRAM_BOT_TOKEN.

## [0.6.2] - 2026-10-24

### Deprecated

- `DEFAULTS.autoDownload` is unused; `createBot` keeps downloading incoming files eagerly. The value stays for compatibility.

### Changed

- The homepage and MCP Registry website URL point to https://telegram.ghostpaw.dev/.

### Fixed

- Refresh searchable text when stored messages are edited.
- Filter incoming chat updates by `allowedChatIds`, configurable on `createBot`; an empty list, the default, allows all chats.
- Mirror messages sent through the bot client and count them in `getStats().messagesOut`.

## [0.6.1] - 2026-10-24

Tagged but never published; the release check failed on a size budget. Its changes ship in 0.6.2.

## [0.6.0] - 2026-10-24

### Added

- MCP stdio server and public MCP entry with protocol negotiation and registry tool schemas.
- CLI for tool discovery, calls, and skill output, with configurable SQLite paths.
- Generated Agent Skill, workflow references, plugin and registry manifests, and secret token configuration.
- Dockerfile and MCP Bundle staging and packaging support.
- Size, API, consumer, startup, and ratchet guards with benchmarks and publishing workflows.


## [0.5.0] - 2026-10-24

### Added

- Built-in fetch Bot API client with multipart uploads, polling, webhook secret checks, and token-masked errors.
- Markdown renderer parity tests against marked and transport tests using injected fetch.
- Separate `test:dist` checks after the build in CI and release workflows.
- Opt-in execution facade with configurable rate limits, bounded retry_after handling, and token masking.
- Contributor guidance and tests for built ESM/CommonJS lazy dependency paths and incoming updates.

### Changed

- Removed runtime dependencies grammy and marked.
- Use structural in-repo Bot API types in normalization, update dispatch, command middleware, menu synchronization, and bot adaptation signatures. TypeScript users can continue passing grammy values; signatures no longer reference grammy types.
- Uploads made through `adaptBot` with a grammy Bot now go directly through the built-in Bot API client, so grammy API transformers do not apply to file uploads.
- Use a synchronous in-repo Markdown parser and retain grammy and marked only for development compatibility tests.
- Require zero runtime dependencies in the package check.
- Load HTTP server support synchronously on first use to reduce import cost.
- Document plan-only and execute modes, database pragmas, and runtime dependency policy.
- Clarify use of bot.client with outbound executors and streams.

## [0.4.0] - 2026-04-06

### Fixed

- Fixed edit history, reaction counts, and transactional message intake.

## [0.3.3] - 2026-04-05

### Changed

- Released publishing workflow updates.

## [0.3.2] - 2026-04-05

### Changed

- Updated publishing to use trusted GitHub OIDC authentication.

## [0.3.1] - 2026-04-05

### Fixed

- Fixed export ordering for lint compatibility.

## [0.3.0] - 2026-04-05

### Added

- Exposed the adapted bot client and MockBot type.

## [0.2.0] - 2026-03-29

### Changed

- Updated usage documentation to match the public API.

## [0.1.4] - 2026-03-28

### Added

- Added eager file downloads on message receipt.

## [0.1.3] - 2026-03-28

### Added

- Added SQLite BLOB storage with SHA-256 deduplication.

## [0.1.2] - 2026-03-28

### Added

- Added webhook transport, media send helpers, and file downloads; reorganized documentation.

## [0.1.1] - 2026-03-28

### Changed

- Added statistics, bot adaptation, streaming updates, FTS tokenization, and license documentation.

## [0.1.0] - 2026-03-28

### Added

- Initial Telegram transport, SQLite storage, rendering, streaming, and tool facade.

[Unreleased]: https://github.com/GhostPawJS/telegram/compare/v0.7.6...HEAD
[0.7.6]: https://github.com/GhostPawJS/telegram/compare/v0.7.5...v0.7.6
[0.7.5]: https://github.com/GhostPawJS/telegram/compare/v0.7.4...v0.7.5
[0.7.4]: https://github.com/GhostPawJS/telegram/compare/v0.7.3...v0.7.4
[0.7.3]: https://github.com/GhostPawJS/telegram/compare/v0.7.2...v0.7.3
[0.7.2]: https://github.com/GhostPawJS/telegram/compare/v0.7.1...v0.7.2
[0.7.1]: https://github.com/GhostPawJS/telegram/compare/v0.7.0...v0.7.1
[0.7.0]: https://github.com/GhostPawJS/telegram/compare/v0.6.2...v0.7.0
[0.6.2]: https://github.com/GhostPawJS/telegram/compare/v0.6.1...v0.6.2
[0.6.1]: https://github.com/GhostPawJS/telegram/compare/v0.6.0...v0.6.1
[0.6.0]: https://github.com/GhostPawJS/telegram/compare/v0.5.0...v0.6.0
[0.5.0]: https://github.com/GhostPawJS/telegram/compare/v0.4.0...v0.5.0
[0.1.1]: https://github.com/GhostPawJS/telegram/compare/v0.1.0...v0.1.1
[0.1.2]: https://github.com/GhostPawJS/telegram/compare/v0.1.1...v0.1.2
[0.1.3]: https://github.com/GhostPawJS/telegram/compare/v0.1.2...v0.1.3
[0.1.4]: https://github.com/GhostPawJS/telegram/compare/v0.1.3...v0.1.4
[0.2.0]: https://github.com/GhostPawJS/telegram/compare/v0.1.4...v0.2.0
[0.3.0]: https://github.com/GhostPawJS/telegram/compare/v0.2.0...v0.3.0
[0.3.1]: https://github.com/GhostPawJS/telegram/compare/v0.3.0...v0.3.1
[0.3.2]: https://github.com/GhostPawJS/telegram/compare/v0.3.1...v0.3.2
[0.3.3]: https://github.com/GhostPawJS/telegram/compare/v0.3.2...v0.3.3
[0.4.0]: https://github.com/GhostPawJS/telegram/compare/v0.3.3...v0.4.0
[0.1.0]: https://github.com/GhostPawJS/telegram/releases/tag/v0.1.0
