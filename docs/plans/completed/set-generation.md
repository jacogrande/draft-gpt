# Build set generation and a real pack preview

Started 2026-10-15. Implementation follows [the spec](../../specs/set-generation.md).

## Progress

- [x] Inspect existing generation, persistence, draft consumers, and local test services.
- [x] Verify official Responses, Decisions, and Sonnet structured-output documentation.
- [x] Implement provider contracts, setting prompts, slots, and validation.
- [x] Implement persistent jobs, parallel generation, screening, reviews, revision, and budget recovery.
- [x] Implement manifests, independent card copies, shared art, and player progress.
- [x] Run backend, type, lint, build, and browser checks.
- [x] Generate and present one real fifteen-card preview with provenance and review results.

## Configuration

OPENAI_API_KEY is present in .env.local. The user explicitly chose Luna for every stage, replacing the initial Sonnet allocation. No Anthropic key is required. Never print credential values. Existing mana-shortcut changes and their test are unrelated and must be preserved.

## Validation and completion

Use fake providers for integration/browser testing. Real generation is authorized by the user, with Luna setting/archetypes/cards/reviews and Luna Decisions. No production deployment is authorized. A preview is not evidence of completed human format/playtest acceptance.

## Decisions and discoveries

- The user chose Luna for all stages on 2026-10-15. No Anthropic provider is configured.
- The first live candidate invented an ambiguous mechanic. The initial profile now uses familiar mechanics; custom mechanics await semantic evaluation.
- Fixed skeletons need overlapping pair assignments and a complete fixing cycle. Validators now preserve assignments, constrain exact displayed types, and verify fixing colors.
- Reviewers can suggest costs outside the fixed slot, mistake valid rules text for an error, or set `blueprintBroken` despite listing only card edits. Repair messages identify exact constraints; blueprint failure requires an explicit blocker. Reviewer calibration remains necessary.
- Concurrent fake completions exposed Convex write contention. Completion and dispatch now use separate, coalesced scheduled steps, and obsolete queued work is cancelled. Persistent usage history includes conservative charges for uncertain failed requests.
- An HMR response-shape transition exposed a missing-array assumption in the setting guide; legacy fallbacks now protect both arrays.

## Results

The backend suite passes 108 tests, including 135/270-card generation, all three rounds without new text calls, partial repairs, targeted editing and rescreening, stale callback rejection, late shared art in decks, provider recovery, quality gating, closed lobbies, and budget exhaustion. Typecheck, lint and build pass. Build still reports existing Vite/Remix deprecations and the missing Goudy font reference.

Browser sessions SetAna and SetBen completed a full shared-set draft and each reached a 45-card mainboard. Checked progress, setting guide, both themes, reload, independent packs, picking and round transitions. No additional page errors appeared after fixing the initial HMR issue. Screenshots are in `.artifacts/`.

The real preview is `.artifacts/pack-preview-v2/index.html`, with `pack.json`, `set.json`, checkpoints and a request ledger beside it. It contains fifteen illustrated cards drawn from a 135-card Luna inventory, 675 initial Decisions checks, and 22 revised designs. The final reviewer still flags three issues: two common removal interactions and duplicate BG fixing. This is a human-validation candidate, not an automatically approved draft. No gate was bypassed in the app.

Text usage reported across this candidate's development retries totals approximately $0.2186; fifteen images were conservatively charged $0.60 in the local ledger, not measured at that invoice amount. The earlier rejected candidate is separately retained in `.artifacts/pack-preview`. This development run crossed prompt revisions, so it is not a clean benchmark or a calibrated power evaluation.

The final fresh browser run also reached fifteen-card packs for both players after queue coalescing and fixing-cycle validation, with no new backend contention errors in that run. Local test services were stopped after verification.

## Remaining acceptance beyond this implementation

Human feedback on the preview, a calibrated decision fixture corpus, a real 270-card run, exposure simulations and draft/play sessions are still required before enabling the feature by default. Production was not deployed. See the set-generation spec for the complete acceptance gate.
