# Whole-set critique and revision

Requested October 21, 2026: after creation, pass the entire set to Luna, critique uniqueness, mechanics, archetype identity, flavor and power, and update an arbitrary number of cards.

Implemented by extending the existing pair/global review → editorial plan → targeted revisions → complete final review. New audits require explicit coverage, card evidence and every requested pair. Reports allow 270 issue groups and all 270 cards can be revised through eighteen writing batches. Atomic current-inventory name checks repair concurrent rename collisions. Preview and evaluation tools use the same contracts and name validator. A new saved-set CLI preserves source and partial results. See [the contract and evidence](../../specs/set-review.md).

Engineering acceptance: 150 tests, typecheck, lint, script lint and build pass. Two browser players received fifteen-card Busted packs and refreshed successfully with fake services. No browser errors; test stack stopped. The earlier intermittent duplicate-name test failure and later successful verification are recorded in the spec.

Model probe: eighteen first-attempt validated calls, 74 accepted replacement records (66 actually changed cards), no remaining duplicate names, 12.17 minutes and $0.1988836. Final review retained three major issues; publication stayed blocked. This verifies execution of the review/edit pipeline, not quality approval. Raw evidence and frozen hashes: `.artifacts/set-review-v13-busted-270/`.

No deployment or human playtesting was performed. Fresh-generation quality acceptance remains open.
