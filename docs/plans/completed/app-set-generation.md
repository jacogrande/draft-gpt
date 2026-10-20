# Use the reviewed set pipeline for app drafts

## Scope
Make the preview's shared Luna set pipeline the default for new app drafts, retain explicit legacy rollback and existing drafts, and share partial-batch repair handling between the app and preview. Preserve final-review publication gates, fixed slots, budgets, keyed jobs, and hidden future packs. No deployment is included.

## Acceptance
- [x] Integration coverage proves default selection, rollback compatibility, and bounded repairs preserving accepted cards/names.
- [x] New starts use the pipeline without an opt-in environment variable; previews and app share repair policy.
- [x] Current specs and operational instructions reflect the default.
- [x] Tests, typecheck, lint, build, and a complete two-player browser draft pass.

## Evidence
At the start of this change, the app already shared prompts, model settings, contextual review, edit planning, final review, and collation with the preview. Its start mutation required `SET_GENERATION_ENABLED=true`; absent configuration took the old per-pack path. Partial repairs also retained outdated design context and did not reserve newly accepted names. The preview-only checkpoint replay fix does not apply to the app's persisted job state.

## Result and verification
New starts default to the Luna set pipeline; explicit `false` retains the legacy start path. Both modes keep their path after the switch changes. `set/repair.ts` now owns partial repair context and name reservations for app and preview. The new regression first failed because a retry accepted a name already used by an accepted card; it now rejects that collision, repairs only the outstanding slot, and preserves the first card.

All 119 tests pass, plus typecheck, lint, build, and diff whitespace checks. One earlier run hit the existing fixed 30-second simulated settling limit and passed in isolation; set tests now poll public lobby ready/error state under a 180-second simulated deadline with presence updates. Existing font and framework build warnings remain.

Browser sessions `app-ana` / `app-ben` (AppAnaOct16 / AppBenOct16) used the fake stack with `SET_GENERATION_ENABLED` unset. Lobby `zany-orb` showed both players the 135-card generation progress, dealt 15-card packs, rendered the setting/archetype guide, and passed 14-card packs after the first picks. Both completed all three rounds and displayed 45 cards in the deck tab. Neither browser reported errors. Screenshot: `.artifacts/app-set-generation/setting-and-pack.png`. Test stack and browser sessions stopped.

No new paid model generation or production deployment was performed. The preceding Glass Inlet run supplies real-model evidence; this browser check proves application integration with fake services. The final-review publication gate and remaining power/playtest limitations remain in place.
