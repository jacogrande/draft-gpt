# Generate a fresh pack through review-only set design

## Purpose
Remove required Decisions screening/rescreening, retain code validation plus contextual reviews and final review, and generate a new 135-design candidate with a collated 15-card illustrated HTML pack for the user.

## Scope and acceptance
New normal runs make no Decisions calls and supply no classification labels to editors. Every card still receives global review; revised cards reach final review with their issues. Legacy screening jobs remain readable, and the Decisions adapter/evaluation tools remain available offline. Quality failures still block app publication; preview artifacts honestly expose unresolved issues.

## Progress
- [x] Integration tests first; change scheduler and shared preview path.
- [x] Update current specs and offline evaluation defaults.
- [x] Run software and two-player fake-browser checks.
- [x] Run a bounded real 135-card generation and export one pack with art.
- [x] Inspect/open the HTML and record cost, quality, and limitations.

## Constraints
Keep existing uncommitted work. No deployment. Use the existing $5 preview cap and checkpoints; do not bypass quality gates or silently reroll/cherry-pick a pack. Model/creative/power policy remains unchanged apart from removing screening context. No new API credentials are needed.

## Engineering evidence
The new integration assertions failed against the old screening flow and passed after the transition changes. Typecheck, lint and build pass. First full test run under concurrent build/startup load had one missing-design test fail to settle; that test passed in isolation, and the full rerun passed all 117 tests without changing code or waits. After adding the name-repair regression, all 118 tests passed; typecheck and lint also passed.

## Live run
Output: `.artifacts/pack-preview-v7-review-only/`. New blueprint: Glass Inlet. The first brief required a neighbor-ID repair. Accepted work and usage are checkpointed. Full text generation/review precedes seeded collation and art for 15 selected cards.

Browser check passed in sessions `review-ana` and `review-ben`: both received 15 cards, picked, and received 14-card packs; the setting panel rendered, and browser error lists were empty. Screenshot: `.artifacts/review-only-browser/setting-and-pack.png`. Fake stack stopped. Existing font/framework build warnings remain unchanged.

## Result
Generated 135 designs, reviewed all ten archetypes plus the complete inventory, and revised 63 cards. The final inventory has no structural problems. Seeded collation produced 10 commons, four uncommons and one rare; all 15 have art. Opened `.artifacts/pack-preview-v7-review-only/index.html` in Vivaldi. A separate browser verified 15 cards and loaded images, no page errors, and no horizontal overflow at desktop or 390-pixel widths.

Final review retained one major issue (U005 chooses its recovery target before milling) and two minor issue groups (C021 and C033/C043/U009). The candidate remains unapproved, with reviewer notes in HTML/JSON and no app publication. C021 is in the selected pack. Several cards still look below the requested Modern Horizons rate, including C062; this run demonstrates the pipeline, not power calibration or playtest acceptance.

The ledger records $0.17588 in estimated text charges and $0.60 in conservative art reservations. It contains zero screening/rescreening calls. These are estimates, not billing reconciliation; canceled in-flight work during the checkpoint correction below may add a small unrecorded charge.

Two duplicate-name repairs initially exhausted retries because feedback omitted the rejected names and conflicted with an instruction to rename the other card. Parser feedback now identifies the exact slot/name and requires a distinct name; a regression test covers rejection and successful repair. CLI feedback reinforces the name constraint.

A restart also retried the previously rejected first brief, generating an unintended Glassreach branch. Stopped it, retained its artifacts/charges, and fixed cached failures to replay their errors. Added `--resume-brief=<saved-brief.json>` and resumed the original accepted Glass Inlet brief at `brief-983347812fe7c12ad8bb.json`; original cards and reviews were preserved. No candidate reroll or manual card selection was used for the exported pack.
