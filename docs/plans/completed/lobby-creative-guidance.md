# Lobby chat as creative guidance

Authorized October 21, 2026: build the proposed chat → extracted preferences → blueprint → card assignments → review flow, with optional “Use this idea” support and a visible summary. No production deployment.

Implementation: retain the complete bounded conversation (up to 200 × 500 characters), anonymize authors, save support and stable message references at start. One Luna interpretation pass extracts preferences, corrections, exclusions, unsupported requests and unresolved disagreement without inventing lore. Empty conversations skip the call. Parse and validate provenance before storing; retries reuse the snapshot, and fresh candidates reuse a completed interpretation. Raw chat is supplied only to interpretation; the blueprint accounts for every preference. Slots assign accepted ideas to card expressions, and reviewers check the same guidance. Application format and power constraints outrank suggestions; random directions fill gaps.

UI: optional idempotent per-member support, a pre-start preview of marked suggestions, and a read-only extracted summary with source quotes and the world's disposition after generation starts. No extra mandatory approval or model call on each message.

Validation: public backend tests for access, support, freezing, provenance repair, stage propagation and retries; core parser tests for coverage/conflicts/contracts; full tests/typecheck/lint/build; two browser sessions for posting, support, refresh, summary, generation and visibility. Paid model quality is distinct from fake-service engineering acceptance.

Status: complete in source; not deployed. The [implemented contract](../../specs/lobby-creative-guidance.md) owns behavior and limitations.

Acceptance: 143 tests in 29 files, typecheck, lint (including changed CLI tools), and production build pass. Two-player local browser checks covered posting, shared support/removal, refresh, persisted source-linked summary, fifteen-card packs, and light/dark setting panels at 1440×1000 and 1280×800 with no browser errors. The test stack was stopped afterward. Screenshots: `.artifacts/chat-guidance-browser/`.

A real Luna probe ran three conversation interpretations and a complete 135-slot world for $0.0200074. It preserved corrections, explicit exclusions, disagreements and fixed-format boundaries. Saved responses and source hashes are in `.artifacts/chat-guidance-20261021/`; the final deterministic support-signal addition is covered by tests and postdates that probe. No real cards/art or human playtesting were part of this wave. Existing full-set quality and production-release gates remain open.
