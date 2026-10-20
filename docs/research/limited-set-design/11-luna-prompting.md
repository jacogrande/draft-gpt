# Luna prompting and evidence tools

Researched and implemented 2026-10-16. Current runtime update: pipeline 2/prompt 7 removes required Decisions screening and rescreening; the classifier below remains an offline experiment. Historical measurements retain their original request versions. Target: original, concrete settings and interactive Modern Horizons-strength draft cards. This is a tested development configuration, not a claim of perfect prompting or balanced gameplay.

## What current OpenAI guidance actually establishes

| Finding | Consequence here | Primary source |
|---|---|---|
| GPT-6 Luna supports structured outputs and reasoning efforts `none`, `low`, `medium` (default), `high`, `xhigh`, `max`. Responses supports its tool use. | Keep `gpt-6-luna` and Responses. Compare effort settings on our task; do not assume more reasoning always helps. | [Luna model documentation](https://developers.openai.com/api/docs/models/gpt-6-luna) |
| GPT-6 family prompting advice is a starting point based on Astra and should be tested on the chosen model. | Distinguish family advice from evidence about Luna. Do not transplant an Astra agent harness or quote older-model benchmark improvements as Luna results. | [Latest-model guide](https://developers.openai.com/api/docs/guides/latest-model) |
| Direct goals, delimiters, explicit constraints and success criteria help reasoning models. Asking for a reasoning transcript is unnecessary; examples should be targeted and consistent. | Give one stage assignment, the fixed contract and relevant evidence. Request concise review evidence in the schema, never chain-of-thought. Keep the concrete-prose examples in world creation. | [Reasoning best practices](https://developers.openai.com/api/docs/guides/reasoning-best-practices) |
| `instructions` has higher priority than ordinary `input`; relevant context helps constrain the task. | Put creative policy, power target and stage instructions in `instructions`. Player ideas and candidate text are delimited JSON data. Remove raw player ideas after freezing the blueprint. | [Prompt engineering](https://developers.openai.com/api/docs/guides/prompt-engineering) |
| Structured output can still contain mistakes. | JSON validation proves shape and fixed-slot compliance, not color correctness, good prose or balance. Preserve independent semantic screening, review and human checks. | [Structured outputs](https://developers.openai.com/api/docs/guides/structured-outputs) |
| Decisions is a Luna classification endpoint with shared input, distinct choices and up to 200 questions; it does not call tools. | Precompute required evidence. Six independent pass/review questions per card produce 90 questions for a batch of 15. Use Responses for explanations and repairs. | [Decisions guide](https://developers.openai.com/api/docs/guides/decisions), [create reference](https://developers.openai.com/api/reference/resources/decisions/methods/create) |
| Evaluations should be task-specific, repeated and calibrated with people. Hosted Evals becomes read-only October 31 and is scheduled to shut down November 30, 2026. | Use a local versioned runner with saved requests/results. Maintain a separate future human-labeled holdout and playtest gate. Do not introduce a dependency on the retiring hosted service. | [Evaluation best practices](https://developers.openai.com/api/docs/guides/evaluation-best-practices) |
| Cache reuse depends on eligible matching prefixes and request settings. A shared static prefix alone does not guarantee a cache hit. | Stable instructions precede variable input. No cache savings are claimed, and this change does not configure explicit cache breakpoints. | [Prompt caching](https://developers.openai.com/api/docs/guides/prompt-caching) |

The model page currently publishes the `gpt-6-luna` alias. We do not invent a dated snapshot identifier. Saved prompt/catalog versions and actual request IDs help investigate drift, but an alias is not an immutable model snapshot. Reasoning-enabled requests omit temperature and top-p. General reasoning guidance sometimes discusses older models; the implementation choices below are DraftGPT hypotheses tested locally, not additional provider guarantees.

## Prompt contract

The request has three parts:

1. **Instructions:** original-card task, trust boundary, Modern Horizons target, full-cost comparison policy, concrete creative direction, supported representation, and the single stage's assignment.
2. **Tool evidence:** selected real-card references plus factual inventory observations.
3. **Task data:** frozen blueprint, slots, current cards, applicable screens, issues and repair feedback. Only world creation receives original player ideas.

`convex/draft/set/prompts.ts` composes the request; `stageInstructions.ts` holds stage assignments. `creative.ts` contains the full worldbuilding guidance; card stages use a shorter equivalent. `references.ts` defines the power policy. Schema, parsing and fixed slot validation remain separate.

The writer must supply useful output at the assigned cost. The reviewer must establish a rate deficit before asking for a buff, or a concrete affordable sequence before asking for a nerf. Counting all card, mana, timing and setup costs prevents both weak expensive cards and unnecessary taxes on fair engines. If a slot fixes a five-mana cost, repair its effect at five mana rather than suggesting an illegal cheaper cost.

World descriptions establish terrain, routes, settlements, work, material resources and observable magic. Physical behavior implies the emotional subtext. Figurative language compares two imaginable subjects through a perceptible shared property. This is our chosen house style, not a universal prohibition in literature or an OpenAI model requirement.

## Evidence tools

These are deterministic domain functions run before the request. They are not model-selected function calls. Required evidence should not depend on whether the model decides to retrieve it, and Decisions cannot perform that retrieval itself.

### Role reference selection

`referenceSelection.ts` reads a generated catalog of all 87 curated entries from [the reference library](10-modern-horizons-power.md). It searches within the same supported primary card type, then ranks role-tag overlap, rarity, mana-band distance and color compatibility. It selects a target, weak boundary and strong boundary where available. This is a transparent heuristic; it is not a learned similarity score or a guarantee that the closest card is a perfect analogue.

The context deduplicates to at most 48 cards and prioritizes target coverage. Each comparison includes its ID, mana mismatch, color mismatch and rarity match; each reference retains the printed type line and power/toughness, paraphrased effect, full-cost/support caveats, editorial rationale and source link. Different-color or different-cost comparisons remain explicitly qualified. Conditional upper boundaries do not automatically condemn a candidate. Constructed bans are not Limited ratings. The two supplemental combo-warning entries remain available in the catalog; the automatic three-band selector does not currently inject them.

Writers, screeners and reviewers receive this same selection policy. Real cards inform rates and roles, not copied card names, text or setting identities. The source library remains the editorial home; generated runtime files are reproducible:

```sh
bun scripts/sync-power-references.ts
bun scripts/sync-power-references.ts --check
```

### Factual support report

`support.ts` reports expected, planned and inspected counts; assigned commons and inspected cards by pair; observed creature mana curve; and assigned mechanic names missing from visible rules text. A name mismatch is a prompt to inspect semantic implementation, not a hard rejection.

A complete inventory requires exactly the expected number of distinct matching slot and card IDs. Anything else is labeled `partial_sample`. Pair assignment counts do not prove synergy or draft exposure. A partial review must not invent absent cards or declare full-set readiness. The report is not a rules engine, combo solver or simulated playtest.

### Offline screening and runtime review

The retained offline Decisions tool asks separately about slot/mechanic fit, color, complexity, power floor, power ceiling and creative fit. Its choices are `pass` and `review`; uncertainty routes to contextual review. Probabilities are recorded as model output, not treated as calibrated confidence in balance. Current rescreen answers replace earlier answers with the same card/criterion name.

Review, edit planning, revision and final review use medium reasoning; world creation, slot planning and generation use low. Review, edit-plan and final output allowances are 24,000 tokens, including reasoning; a 15-card probe nearly exhausted the previous 8,000-token allowance. Reservations include this headroom. This is a provisional stage policy. The local effort comparison below measures only small reviews; it does not establish the optimum effort for every stage. Final review independently reassesses cards that previously passed and verifies material repairs.

## Local inspection and evaluation

```sh
# Print an inspectable development request without an API call.
bun scripts/inspect-set-prompt.ts
# Inspect a saved job/task, including instructions, input, questions and reservation.
bun scripts/inspect-set-prompt.ts path/to/task-or-job.json /tmp/prompt.json
# Replay one saved task under current prompts with an optional effort override; $0.10 cap.
bun scripts/replay-set-task.ts path/to/task-or-job.json .artifacts/replay.json medium
# Run 2 repeats at each effort plus one Decisions screen; $0.25 reservation cap.
bun scripts/evaluate-power.ts .artifacts/power-eval-v6 2
# Regenerate and revise the known 15-card failure sample; $0.50 reservation cap.
bun scripts/evaluate-set-prompts.ts .artifacts/pack-preview-v2/set.json .artifacts/prompt-pilot-v7
```

The first live runner uses eight versioned development cases: weak rate, missing flashback, excessive fast mana, a spell lock, and four strong acceptable controls. Expected labels are never sent to the model. It saves the rendered requests, reference IDs, effort, latency, parse status, usage, material issues, missed cards and control false positives. Review metrics are card-level and require reading the actual evidence; flagging a card for the wrong reason is not a successful diagnosis. Decisions dimensions are compared separately.

The 15-card pilot uses previous failures and therefore is also a development probe, not a holdout. When replanning under its new blueprint, it clears old mechanic IDs while preserving the fixed slot constraints; old IDs are not valid definitions in a newly generated world. It now forwards initial screens and rescreens into contextual review, and stores the actual enriched requests. Reservation estimates include the rendered reference context and screening questions. Both tools stop on transport failure rather than retrying a rate limit blindly; production jobs retain their existing bounded backoff.

Usage-based text costs use the project's current flat-rate estimator. They are not an invoice and do not model cache-write premiums/discounts. Art, full-set draft exposure and human playtesting are outside these small evaluations. Do not use a passing small fixture to close the production quality gate.

## Observed results

All results below are development observations from October 16, not statistically reliable accuracy estimates. The revision was informed by the same cases, so this is explicitly not held-out evidence.

| Review configuration | Expected problematic cards flagged as major, across two runs | Strong controls incorrectly flagged as major |
|---|---:|---:|
| Prompt 5, low | 7 / 8 | 0 / 8 |
| Prompt 5, medium | 7 / 8 | 0 / 8 |
| Prompt 6, low | 8 / 8 | 1 / 8 |
| Prompt 6, medium | 8 / 8 | 0 / 8 |

Prompt 5 sometimes classified a missing assigned flashback ability as minor. Prompt 6 explicitly makes confirmed missing assigned mechanics major. It also clarifies immediate artifact activation and separates floor/ceiling concerns. Medium preserved fixed mana slots in its suggested repairs in both prompt-6 runs; low suggested changing the zero-mana fixture's fixed cost in both runs. Medium review latency was about 29–37 seconds versus 6–7 seconds for low in this probe. These observations support a provisional medium-review default; they do not establish universal superiority or prove the proposed replacement effects balanced.

The prompt-6 Decisions call disagreed with 6 of 24 expected slot/floor/ceiling labels (the call contained 48 questions overall). Three disagreements were overlapping slot judgments on cards with real power problems; two incorrectly marked excessive cards as failing the floor; one passed the weak filtering spell's floor. Its slot question still flagged that spell's missing flashback. All four problematic cards reached review and none of the four controls was flagged on these three dimensions. The additional floor/ceiling wording did not solve dimension confusion: prompt 5 had five disagreements. These results motivated removing the classification stages from normal generation. Keep the criteria in contextual review, not as calibrated classification measurements or automatic editing commands.

Reading the reviews also exposed remaining card-accounting mistakes and weak repair suggestions, despite correct card-level flags. This is why the runner saves the evidence and corrections, and why the final review and human gate remain necessary. Passing JSON validation or finding the right card is insufficient to claim a correct diagnosis and repair.

The eight-card probes reported about $0.0096 for prompt 5 and $0.0088 for prompt 6, including their Decisions calls. Art was not generated. Artifacts: `.artifacts/power-eval-v5/` and `.artifacts/power-eval-v6/`.

A same-input medium-writing replay accepted only 13 of 15 designs: two violated their fixed type/rarity/world contract, and several accepted designs remained weak. It cost about $0.0049. This one comparison does not support switching generation to medium. Low remains the writing default. Replay now reports partial batches and exits unsuccessfully when any required card is absent; repair feedback names the exact slot and expected type, rarity or world.

The prompt-5 15-card regeneration pilot flagged 9 of the 11 historical weak cases before regeneration. Its editing pass still left two major artifact-rate concerns at final review; that is a failed readiness result, not a validated pack. Reported text cost was $0.0340. Artifacts: `.artifacts/prompt-pilot-v5/comparison.json`.

The prompt-6 pilot flagged 10 of 11 historical weak cases and one of four historical controls; these old controls were not calibrated to the newer MH target, so the latter needs human adjudication. It regenerated all 15 cards, revised nine, and ended with a major inconsistency between two definitions of the same Scrap token. The candidate remains unapproved. It reported $0.0488 in text cost, including two incomplete reviews at the original 8,000-token cap and two slot-planning repairs for stale mechanic IDs. A replay with the new 24,000-token allowance returned a parsed review for about $0.0050. The larger ceiling is headroom, not a promise that every global review will finish within it. Artifacts: `.artifacts/prompt-pilot-v6/comparison.json` and `review-24k.json`.

The live probes used reference catalog version 1. A final catalog audit added explicit printed power/toughness and full type lines (catalog version 2), since effect summaries did not always contain those facts. Selection and editorial judgments are unchanged. Catalog synchronization and software tests cover this addition; the live metrics above describe the recorded requests, not a fresh measurement of catalog 2. Total estimated text spend across these probes and replays was approximately $0.11.

Software validation: 117 tests passed, including signed-in pipeline integration coverage and bounded-reference/partial-inventory regressions. Typecheck, lint, catalog synchronization and production build passed. The build retains existing font-path and framework migration warnings. The full suite was rerun after the final tooling and repair-feedback changes.

Browser validation used fake services with sessions `luna-ana` and `luna-ben`: both saw generation progress, received 15-card packs, picked a card, and received 14-card packs. The setting/archetype panel rendered and neither browser reported page errors. Screenshot: `.artifacts/luna-prompt-browser/setting-and-pack.png`. The stack was stopped afterward. This checks the flow, not generated-card quality; other themes, reconnects and full draft completion were not repeated for this prompt-only change.

Production deployment, broader setting evaluation, a separately held-out human-labeled corpus, full 135/270-card generation and draft/play tests remain open. No production rollout is implied.
