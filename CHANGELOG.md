# Changelog

All notable changes are documented here using Keep a Changelog 1.1.0.

## [Unreleased]

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

[Unreleased]: https://github.com/GhostPawJS/telegram/compare/v0.6.0...HEAD
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
