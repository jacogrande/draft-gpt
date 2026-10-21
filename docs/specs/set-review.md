# Whole-set critique and revision

Implemented October 21, 2026: pipeline 5, prompt 13, schema 3, rubric 6. Luna remains the reviewer and editor. This extends the existing post-generation pipeline; it does not add another independent review layer.

Pipeline 6 subsequently changes review and edit-plan reasoning to `none` at the user's request; revision and final verification remain `medium`. Audit contracts are unchanged. The measurements below predate that setting change; see the [startup plan](../plans/active/three-minute-drafts.md) for the 15-second world target and remaining latency work.

## Flow

After all 135 or 270 initial designs are saved, ten color-pair reviews and one global review run. The global request receives the entire set: all card records, fixed slots, frozen world, color identities, archetypes, accepted player guidance, power policy, factual support counts and reference-card evidence. It can compare cards across writing batches.

Every review, the editorial plan and the final check use the five-axis contract:

| Dimension | Required assessment |
| --- | --- |
| Uniqueness | Duplicate names, equivalent rules/roles, excessive repetition in triggers, subjects and art; distinguish deliberate cycles and shared support |
| Mechanics | Executable rules, costs, targets, timing, tokens, required mechanics and applicability to the card type |
| Archetype identity | Actual enablers/payoffs, early plays, resource loop, win condition, answers, weaknesses, neighboring overlap and distinction |
| Flavor | Concrete supernatural setting, coherent subjects/names/art/flavor, color identity and accepted player preferences/exclusions |
| Power | Useful floor and supported ceiling at Default/Busted strength; full costs, timing, factual references, actual combo sequences and counterplay |

The saved audit lists every inspected slot, evidence for each dimension, issue IDs belonging to each dimension, and per-pair assessments with actual enabler/payoff IDs. A pair review covers its own pair; the global review, editor and final check assess all ten. A partial offline sample must not claim complete support or whole-set readiness.

Pure validation rejects missing/repeated cards, dimensions or requested pairs; unknown evidence/issue references; repeated issue IDs; and issues not accounted for by a dimension. These checks enforce coverage and traceability, not the truth of a model's judgments. Old saved tasks without `reviewContract: "five-axis"` retain their legacy review schema. Newly planned application and release-evaluation tasks, and the current preview, use the audited contract.

## Coordinated editing

The editor receives the complete inventory and all review issues, checks current evidence, removes unsupported claims and consolidates compatible fixes. A report supports up to 270 issue groups, each of which may address several cards. Related defects should be consolidated; there is no percentage or card-count quota within the supported set size. If every card needs work, every card can be selected.

The planner turns selected slot IDs into batches of at most fifteen complete replacements. Four workers can run concurrently. Untouched cards remain saved. Required color, rarity, type, cost band and mechanic contracts remain fixed; repairs change the effect or wording inside those constraints. The editor must report an unrepairable frozen contract rather than prescribe an impossible mechanic or silently change the format.

Each response passes the ordinary card parser. Partial responses retain accepted replacements and retry only unfinished slots with their accepted names reserved. Before saving a revision, the application also checks names against the current persisted inventory in the same transaction. If another concurrent batch has claimed a new name, the later card is rejected with its slot and exact rejected name and goes through bounded repair. This also conservatively prevents taking another current card's old name during a simultaneous rename. The shared validator is used by preview and release-evaluation workers against their current in-memory inventories.

The final Luna check receives the entire updated set, including untouched cards, and repeats all five dimensions. It reassesses current costs/text and regressions rather than repeating stale defect evidence. Exact-name and inventory checks also run in code. Any remaining major/blocker issue or an invalid inventory prevents art and pack publication. One coordinated editorial pass remains the current policy; this change does not introduce an unbounded critique/edit loop. Schema/partial-response repairs remain bounded separately, and the existing $5/$7 candidate budgets remain enforced.

## Evidence and limits

`tools.uniqueness` supplies normalized name collisions, matching card signatures (including self-name normalization), and repeated flavor text. Signature and flavor groups are observations only: useful redundancy and cycles are allowed. No semantic uniqueness score is treated as a deterministic verdict. Mechanic-name observations likewise require inspection; absence of a keyword string is not automatically a missing mechanic. Power judgments must count all costs and compare actual supplied reference text.

Review/editor/final requests have a 48,000-token output allowance so broad critiques need not be squeezed into the previous allowance. Reservations use the same limit. This fits Luna's documented 128,000-token output ceiling. Structured output does not establish semantic accuracy; parsed references and independent final inspection remain necessary. See [official OpenAI structured-output guidance](https://developers.openai.com/api/docs/guides/structured-outputs) and [the Luna model contract](https://developers.openai.com/api/docs/models/gpt-6-luna).

Public integration tests cover revising all 270 cards across eighteen batches, final review receiving all replacements, incomplete audit repair, and concurrent rename collisions. Core tests cover audit provenance, complete dimensional/pair coverage, normalized uniqueness observations, legacy parsing and reserved names after rejection. Existing tests continue to cover untouched cards, fixed slots, partial retries, budgets, stale keys and publication failures.

## Review an existing saved set

`scripts/review-set.ts` runs the same planning, critique, editing and final-check contracts against a saved 135/270-card JSON inventory with an explicit power mode. It validates each input card, preserves the input file, removes old image URLs from output, records before/after material in call checkpoints, freezes source hashes and a $2 review-only budget, and saves partial work and failures in `result.json`. No new setting or art is generated. A failed final check exits nonzero and does not become an approved pack. Uncertain charged calls are not silently replayed.

```sh
OPENAI_BASE_URL=https://api.openai.com bun --env-file=.env.local scripts/review-set.ts \
  .artifacts/saved-set/result.json .artifacts/new-set-review
```

A successful repair of an existing candidate is not a fresh-generation success-rate measurement or human format acceptance. Broad quality validation and production deployment remain separate.

## October 21 verification

All 150 tests in 31 files pass, with typecheck, lint, changed-script lint and the production build. A two-player browser run (ReviewAna21/ReviewBen21) using fake services passed through the audited Busted pipeline and dealt fifteen cards to each player. The guest still had fifteen cards after refresh; both sessions reported no browser errors. Screenshot: `.artifacts/set-review-browser/busted-pack.png`. The local test stack was stopped. An earlier full-suite attempt returned no current pack in the existing duplicate-name-editor test; that test passed alone and in the final full-suite run. The earlier intermittent failure's cause is not established.

A real Luna run reviewed the previously blocked 270-card Busted inventory, The Severed Accord. Evidence is preserved in `.artifacts/set-review-v13-busted-270/` with frozen source hashes, request records, ledger and result. This is a repair of a previously edited set, not a new-generation acceptance run.

- All eighteen calls passed response validation on the first attempt: eleven reviews, one editorial plan, five revision batches and one final review.
- The editor selected 74 cards; all 74 replacement records were accepted. Comparing substantive fields shows 66 cards actually changed, including 43 names, 29 rules texts and 58 art directions. Some changes overlap on the same card.
- Exact name collisions were removed and inventory validation passed. The final audit covered all 270 cards and all ten pairs.
- Elapsed CLI time was 12.17 minutes, excluding art and Convex scheduling. Reported text cost was $0.1988836. Pair-review calls took 76–171 seconds; the global review took 140 seconds and final review 137 seconds. This thorough review is a material addition to startup latency.
- Final review retained three major issues (C086's Equipment subtype, C113's printed token definition, and C047's power floor) and two minor flavor-repetition groups. `ready` remained false. No art or packs were published.

The run also exposes reviewer/editor limitations. A reviewer incorrectly described R005's two separate tap abilities as a self-contained infinite-mana loop; the editor discarded that claim and the card remained unchanged. Another review claimed U042 could not return a spell to its owner's hand, and the editor changed it to permanent bounce without substantiating that restriction. C113's edit removed the existing printed artifact definition while expanding its token ability, creating a regression that final review caught. Audit structure improved inspectability and coordinated broad editing; it did not solve factual criticism or establish balanced power. These results remain a failed quality outcome and must not be relabeled as release acceptance.
