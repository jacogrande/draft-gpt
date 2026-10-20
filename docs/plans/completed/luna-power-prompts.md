# Luna prompts with real power references

## Purpose
Use the verified Modern Horizons reference library in every card-design judgment, with scoped Luna instructions and executable context/evaluation tools.

## Context
The previous prompt-v4 sample improved text but missed weak cards and missing mechanics. The 87-entry research library exists but is not connected to runtime. The user explicitly requests implementation and October 2026 Luna prompting research. Preserve Luna, the manual table, fixed slots, keyed jobs, and existing user changes.

## Progress
- [x] Read current official Luna, reasoning, Decisions, structured-output and evaluation guidance.
- [x] Add integration coverage for the new request/context contracts.
- [x] Implement reference retrieval, factual support summaries, focused prompts and screening.
- [x] Add prompt inspection and repeatable low/medium evaluation tooling.
- [x] Run software checks, a bounded real-text evaluation, and browser verification.
- [x] Update research/specification and record observed limitations.

## Decisions
Use deterministic precomputed tools for required context; Decisions cannot call tools. Keep schema validation separate from semantic balance judgments. Preserve output schemas and pipeline stages. Separate power-floor and power-ceiling questions. Keep explicit card costs and context in every reference. Do not claim perfect prompting or objective balance from self-review. Use local evals, not the retiring hosted Evals service.

## Validation
Public signed-in-player integration test checks emitted request contracts, review flow and packs. Pure tests protect retrieval, context limits and partial-sample scope. Live evaluation logs actual prompts, versions, reference IDs, effort, costs, false negatives and false positives. Browser tests use fake services; no production deployment.

## Interim evidence
Prompt 5 exposed missing-mechanic severity errors, Decisions dimension confusion, and invalid proposed slot-cost edits. Prompt 6 makes severity and floor/ceiling distinctions explicit. Medium review flagged 8/8 expected problematic card observations and 0/8 controls over two runs; low flagged 8/8 plus 1/8 controls and violated a fixed cost in both runs. Decisions still has dimension-level disagreements. These are development cases, not held-out quality acceptance.

116 tests, typecheck, lint, build and catalog synchronization passed; 15 affected tests rerun after prompt 6. Fake browser sessions each received 15 cards and exchanged 14-card packs after picking; setting panel rendered, no browser errors, stack stopped. Prompt-6 15-card live pilot completed; final review retained a token-definition inconsistency. No deployment.

## Outcomes
Implemented focused stage instructions, Modern Horizons reference retrieval from all 87 curated entries, factual support reports, separate power-floor/ceiling screens, medium contextual review, exact slot repair feedback, real-prompt budget reservations and 24,000-token review headroom. Added catalog sync/check, request inspection, saved-task replay, an eight-card effort comparison, and updated the 15-card pilot to record actual context and current screens.

Final validation: 117 tests passed; typecheck, lint, build, catalog check and diff whitespace check passed. Fake browser two-player progress/picks/setting flow passed and stack stopped. Live probes cost approximately $0.11 estimated text spend. Both 15-card candidates remain unapproved: v5 retained weak artifacts; v6 retained inconsistent token definitions. Medium-writing replay accepted only 13 of 15 designs. Decisions still has dimension leakage and reviewers still make card-accounting and repair mistakes. Full model calibration and human playtesting are separate outstanding quality gates, not implied complete by this implementation.

Live artifacts use reference catalog 1. Final catalog 2 explicitly includes printed stats/type lines; no editorial judgments or selection weights changed. Its synchronization and software checks passed; it was not included in the preceding live measurements.
