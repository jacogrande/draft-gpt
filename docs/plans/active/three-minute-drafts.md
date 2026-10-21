# Start drafts within three minutes

Requested October 21, 2026. Status: measured baseline and proposed design; pipeline 6 implements the requested reasoning settings locally, while the architecture changes and latency targets remain unvalidated. The whole-set review implementation is committed as `70b1607`. Production is unchanged.

## Outcome and measurement

Target: from the host's Start action to every seated player receiving an actionable first pack, at most 180 seconds. Include conversation interpretation, world creation, slot planning, writing, repairs, review, editing, final validation, scheduling and publication. Cover both 135/270 inventories and Default/Busted. Preserve player intent, fresh worlds, fixed slots, arbitrary-card revision, and frozen card text before the first pick.

Proposed art policy: card text determines readiness; illustrations arrive in the background, with first-round cards prioritized. This changes the existing policy of waiting up to 90 seconds for art. Fully illustrated packs within 180 seconds are a separate requirement and are not established by this plan.

There is no demonstrated three-minute success rate today. A timeout can bound waiting, but cannot guarantee a playable set when the provider is slow or the candidate fails quality checks. Track ready-by-180 separately from timeout, rejected and interrupted outcomes. Never turn a failed review into success to meet the clock. Preparing this lobby's unique candidate before Start can help, but an immediately started cold lobby still needs its own measurement. Reusing unrelated prebuilt sets would conflict with the product's novelty and player-input goals.

## Measured bottlenecks

The latest saved review run, `.artifacts/set-review-v13-busted-270/`, made eighteen first-attempt-valid calls. It reviewed an existing, already edited 270-card Busted candidate, selected 74 replacements, materially changed 66 cards, and still failed final quality review. It is not a fresh successful draft.

| Review-only stage | Observed wall span |
| --- | ---: |
| Ten pair critics plus global critic, four workers | 416.8 s |
| Separate editorial plan | 83.2 s |
| Five revision batches, four workers | 87.2 s |
| Full final review | 137.1 s |

The recorded CLI elapsed time was 12.17 minutes, excluding initial generation, art and Convex scheduling. Stage spans above are reconstructed from each stage's earliest call start to latest completion; small orchestration gaps account for the difference. About 80.3% of the eleven critics' output tokens were reasoning tokens (105,761 of 131,774). The global critic received 120,896 input tokens; the final critic received 121,974. Input includes verbose slot records and reference evidence as well as the actual cards.

Earlier fresh prompt-11 runs also failed quality acceptance. Default-135 took 973.7 seconds; Busted-270 took 835.5 seconds, excluding art. In the latter, world/slots/writing alone took 245.1 seconds, followed by review/editor/revisions/final at 590.3 seconds. The current audited contract differs, so these are diagnostic history, not a matched baseline for the next intervention.

The [batch-size study](../../research/limited-set-design/12-generation-batch-sizes.md) found mean writing times of 65.9 seconds for fifteen cards per request and approximately 63 seconds for thirty or forty-five, with only two repetitions per size. Larger batches alone do not explain a path to 180 seconds. Keep fifteen as the initial experiment default.

Measurement defect to repair first: `scripts/review-set.ts` spreads the source result into its output, retaining the source's `durationMs`, `phases`, `startedAt`, `finishedAt`, request counts and ledger metadata. These describe the old generation, not the new review. Preserve them under explicit source provenance; write new review timing/usage fields and mark resumed runs non-comparable. Existing call checkpoints remain the trustworthy review timing source.

## Proposed critical path

`intent + world → local slot expansion → parallel writers → whole-set audit/edit plan → parallel revisions → independent whole-set verification → deal`

1. **One whole-set audit that produces the edit plan.** Replace eleven overlapping critiques followed by a separate editor with one Luna call receiving every card. Require all five dimensions and all ten pairs, concise evidence and actionable slot-specific corrections. Preserve the ability to select every card; never cap issues at a small quota to save time. Move the eleven-critic configuration to offline evaluation for comparative diagnosis. Validate that a single critic still finds serious cross-card defects before changing the app default.
2. **Compact the contracts and use the requested reasoning settings.** Keep all current card rules, costs, tokens, flavor, art subjects, world rules and relevant fixed constraints. Deduplicate repeated slot/provenance material, references and historical critique prose; retain reference identity and full costs/text needed for power judgments. Avoid repeating 270-slot listings across multiple generated reports when server-authenticated inventory metadata can establish which snapshot was supplied. Preserve model-authored five-axis and pair evidence; server coverage is not proof that the model read or understood every card. The user selected Luna's lowest effort, `none`, for world creation, card writing and critique. Pipeline 6 applies this to `interpret`, `brief`, `slots`, `generate`, `review` and `editPlan`, including their repairs. `revise` and `final` retain medium effort. The existing separate critique/editor calls remain until the combined contract is implemented. Compare the new settings against prior effort levels with held-out defects; no quality or latency win is established yet. Reducing the output ceiling alone is not a demonstrated speedup; truncated structured responses must fail.
3. **Keep an independent final check of the entire updated inventory.** Give it the frozen world, updated full set and an exact edit diff. Prioritize regressions and repaired defects while retaining cross-set checks. It must inspect current costs/text, including untouched cards. Return concise evidence and actionable failures, not a second long design essay. Deterministic checks run alongside it. A bad final result remains blocked.
4. **Increase bounded text concurrency.** Current limits are four jobs per run and eight globally, so a 270-card writer needs at least five waves for eighteen batches. Benchmark eight and eighteen per run, with an explicitly sized global limit, fair scheduling, token/request rate limits and backoff. Reserve budget before dispatch and preserve stale-key checks and atomic name validation. Separate text from image capacity so one lobby's illustrations cannot delay another lobby's draft. More concurrency is a candidate setting, not a guarantee about account capacity.
5. **Remove per-batch slot-planning calls where practical.** Have the world blueprint define compact archetype recipes, mechanic applicability and player-guidance assignments. Expand those recipes over the deterministic rarity/color/type/curve skeleton in code. Preserve enabler/payoff roles, bridges and intent coverage; don't replace creative slot planning with identical generic cards. Validate this independently because it changes design quality, not just serialization.
6. **Let art continue after publication.** Freeze and collate reviewed cards, deal immediately, and update image references as jobs finish. Background art must survive the text run becoming ready: current queue/deadline guards cannot simply be reused unchanged. Give art its own lifecycle, budget, cancellation keys and bounded retries. First-round visibility must not leak other packs to players. Text, costs and rules never change after drafting starts.

Official OpenAI guidance recommends reducing generated tokens, combining sequential requests, parallelizing independent work and using code for deterministic work. These principles motivate the changes above; they do not predict this application's speedup. See [latency optimization](https://developers.openai.com/api/docs/guides/latency-optimization). Luna supports both low and medium reasoning, as well as none; actual quality/latency tradeoffs require our evals. See [the Luna model contract](https://developers.openai.com/api/docs/models/gpt-6-luna).

## Target budget, not a forecast

| Work | Allocated elapsed time |
| --- | ---: |
| Intent, world and local slot expansion | 15 s |
| Parallel card writing and structural validation | 45 s |
| Whole-set critique plus edit plan | 30 s |
| Parallel targeted revisions | 35 s |
| Independent whole-set final check | 25 s |
| Queueing, publication and bounded repair margin | 30 s |
| Total | 180 s |

These are engineering allocations, not measured predictions or per-request timeouts. The user reduced the world/planning target from 25 to 15 seconds; the ten seconds saved increase repair margin within the same 180-second limit. The requirement to revise an arbitrary number of cards must be exercised with the full inventory selected, not just a convenient small repair. If the selected whole-set checks cannot meet both quality and these allocations, this architecture misses the cold-start target. Earlier lobby preparation may reduce visible waiting but does not turn slow generation into a three-minute cold run.

Optional later work: prepare a fresh candidate while a stable lobby gathers. Bind it to a content/version fingerprint covering interpreted guidance, power mode, inventory size, generation versions and seed. Accepted guidance or settings changes invalidate affected work; roster changes can reuse inventory only when size and content requirements still match. Budget speculative work and debounce changes. Do not silently ignore late player input to preserve a fast cache hit.

## Implementation and acceptance

- [x] October 21: inspect current code, commits, recorded phase timings and official guidance; preserve the existing review commit.
- [x] October 21: set the world/planning target to 15 seconds and share `none` effort for world, writing and critique across the application and evaluation executors; preserve medium revisions/final verification.
- [ ] Fix review-only timing provenance and add stage queue/service spans, output/reasoning counts, repair counts and an end-to-end ready-by-180 outcome to shared evals.
- [ ] Benchmark compact whole-set audit/edit planning and independent final check against the existing reviewer fixtures and saved complete inventories. Measure missed defects, false corrections, regressions and all-card repair capacity, not just schema validity.
- [ ] Implement the selected review contract in shared app/preview/eval planning, parsing and fake services. New backend behavior starts with signed-in-player integration tests.
- [ ] Evaluate bounded concurrency and local slot expansion independently, then together with the selected review design. Freeze settings and inputs for each comparison.
- [ ] Separate art readiness and verify two browser players can pick with placeholders, receive late art, refresh and continue all rounds without text changes.
- [ ] Run fresh end-to-end trials for all four size/power combinations and multiple worlds, then simultaneous lobbies. Include actual Convex scheduling and browser first-pack arrival. Report ready count/attempt count, maximum, median, p95 when sample size supports it, and cost per ready set. Every timeout or quality rejection remains in the denominator. Separate cold and prewarmed runs.
- [ ] Add a run deadline and bounded retry policy. At 180 seconds, an unfinished run stops waiting with a clear retry/error outcome; stale completions cannot publish. Count this as a missed playable-draft target, not acceptance. Do not launch retries that cannot fit the remaining stage/run budget.

Keep the current contract available for comparison until the faster version passes quality fixtures and fresh-set readiness checks. Small exploratory samples cannot establish a hard maximum under provider failures. Production deployment remains a separate approval and validation step. No additional paid generations were made for this analysis or the reasoning-setting change. Provider settings are implemented locally; the combined critique, concurrency, local slots and background art proposals remain outstanding.

Pipeline 6 engineering validation: all 150 tests pass, with typecheck, lint, build and local documentation links checked. Integration coverage inspects actual API efforts through brief/partial-writing repairs, critique, editing and final verification; eval coverage verifies the recorded effort matches the outgoing request. The first full run had one failure in the existing all-270-card revision test: no current pack was returned after final review. That test passed alone and in the subsequent full suite. A generation-error assertion was added for diagnosis; the intermittent failure's cause remains unconfirmed. No player-facing screens changed, and no live model speed or quality result is claimed.
