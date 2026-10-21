# Finish non-playtesting refactor work

User authorization (2026-10-20): complete remaining roadmap work outside playtesting. This includes real-provider validation, calibration, release preparation and inspection of domain/migration carryovers. Preserve all existing work. Production deployment follows the explicit approval requirement in AGENTS.md; prepare a concrete tested commit first. Do not count simulated drafts or model review as human playtesting.

Plan:

- Freeze prompt-10 source/config snapshots. Generate Default and Busted candidates at 135 and 270 cards, using production planning, parser, repair and review functions. Save all responses, usage and timings. Do not suppress failed candidates or bypass final review.
- Exercise twelve world-input bundles, including empty, conflicting and instruction-like ideas. Compare literal fantasy, variation and idea handling.
- Evaluate fresh reviewer fixtures with expectations kept out of model requests. Report missed serious defects and false positives by reason, not just any issue attached to a card.
- Simulate seeded pack exposure for two/four/eight players; validate rarity, color, duplicates and availability. Inspect complete generated sets and first-pack comparisons. Measure text readiness separately from art, scheduler overhead and production latency.
- Fix demonstrated implementation defects with meaningful tests; preserve before/after evidence if prompts change. Build an offline HTML report.
- Run the complete engineering checks and browser acceptance as needed. Commit the completed Busted feature and release work, then push normally without rewriting history.
- Inspect production configuration, hosting/domain state and the preserved legacy-deck export. Do not silently import decks without a trustworthy identity mapping.
- Request deployment approval once the exact revision and results are reviewable. Production draft verification requires an authenticated real user and must not enable test login.

Budgets: existing $5/$7 per-candidate ceilings for 135/270, respectively; $1 for world corpus and $1 for reviewer calibration. Image validation limited to a representative fifteen-card pack per mode, within the corresponding candidate budget. No unbounded rerolls.

Observed during baseline: Default-135 rejected an undefined heart-transfer procedure; Busted-135 final review hallucinated a missing sacrifice cost and recommended undefined sunrise timing. Prompt 11 now separates fiction from game procedures, removes old defect prose from final-review inputs, and supplies free-mana anchors. Original prompt-10 calls continue from their already-loaded frozen source and remain unchanged.

Follow-up: run the fresh twelve-world corpus and four held-out reviewer samples against prompt 11, then generate two fresh complete acceptance candidates (Default-135 and Busted-270). These are a labeled intervention follow-up, not replacement results or a matched statistical comparison. Keep the total study ceiling at $26: before the follow-up, baseline actual text cost plus the $2 probe allowance plus $12 for new candidates must fit. Image validation uses the new candidates' allowance. No further prompt-based reroll loop.

Status (October 21): measurement and engineering hardening complete; release quality acceptance is blocked by the recorded candidate failures. See the [results](../../research/limited-set-design/17-release-validation.md). The next quality iteration must address the specific findings rather than silently rerolling this study.

October 21 continuation: the prior session ended with eight review requests in flight across the two 270-card baseline inventories. All 810 initial designs were saved. Those two outcomes are explicitly interrupted, retain uncertain reservations, and have no comparable elapsed time or final verdict. `record-interruption.ts` preserves the saved calls and records this status without replaying lost requests. The fresh prompt-11 candidates run first, then probes and diagnostic art.


Completed: six preserved candidate outcomes (two interrupted), original and corrected calibration, observed regressions, twelve worlds, 126,000 diagnostic packs, thirty images, offline HTML, 136 tests/typecheck/lint/build and local browser checks. Pipeline 3 retains deterministic name defects through edit planning and repairs within-response collisions. Test workers cannot make unmocked network calls. One calibration-fixture metadata bug was fixed and explicitly rerun; undefined-X ground truth was excluded after consulting official rules.

Still open: model-quality acceptance (all four completed candidates blocked), deployment approval, Cloudflare DNS access, authenticated production validation, and the separate legacy import decision. Human playtesting was not performed. No production deploy, test-login enablement, legacy import or gate bypass occurred.

Source release: implementation `1b297af` and its three preceding local commits were pushed to `origin/main` on October 21. The HTML report was checked for offline assets, anchors, escaping and complete card counts, then opened in Vivaldi. Production remains held; no deployment approval was requested against a claim of passing quality acceptance.
