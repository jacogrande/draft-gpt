# Compare card generation batch sizes

## Protocol fixed before real calls
Compare 5, 15, 30 and 45 cards per generation call. Two repetitions of the same 135-slot Glass Inlet inventory per size (1,080 requested cards). Reuse its blueprint, slots and ideas; never show old card designs to writers. Preserve slot order, Luna model, low writing effort, reference retrieval policy, prompt versions and four-worker concurrency. Run one candidate at a time, first in order 15/45/5/30, then reverse order to reduce temporal bias.

The normal response schema caps cards at 15. Evaluation-only options expand that cap to the requested count and allow max(14,000, ceil(14,000 × slots / 15)) output tokens. This tests viable larger requests, not truncation under an artificially small response cap. Production batch sizing and limits remain unchanged.

Measure initial accepted cards, initial complete responses, repairs, remaining failures, total tokens/estimated cost, request durations, actual generation wall time, duplicate names and inventory problems. Apply the shared structural repair planner up to twice. Do not edit model-identified gameplay defects during this comparison: generation quality is the outcome.

Two fresh medium-effort global reviews per candidate receive the full same-order inventory and no batch-size labels, generation errors, or earlier reviews. Report unique major/blocker-flagged cards and reviewer variability, never treat model opinions as win-rate measurements. Manually inspect selected matched slots and notable findings. One world and two generations per arm cannot establish a universal optimum.

Bound all requests to a $3 text-only estimated budget with persisted reservations, costs, request context and checkpoints. No art, deployment or default-size changes. Failures remain in results; no silent rerolls. Use existing API credentials without printing them.

## Progress
- [x] Build and verify resumable eval runner and schema override.
- [x] Run all eight candidates and sixteen blinded reviews.
- [x] Inspect results, document comparisons and recommend a default.

Methodology follows task-specific metrics, repeated measurements and human calibration from [OpenAI evaluation guidance](https://developers.openai.com/api/docs/guides/evaluation-best-practices).

## Engineering checks and manual sample
All 120 tests, typecheck and lint pass. A fake-service smoke run completed all eight inventories and sixteen reviews; an injected missing card was repaired and counted as 134/135 first-pass acceptance, and a second invocation reused checkpoints. Real requests are recorded in `.artifacts/batch-size-eval-v1/`.

The fixed manual comparison uses C001, C019, C062, U001, U025, U026, R006 and M001 across all arms. These include early creatures, Equipment, a previously weak sorcery role, a signpost, interaction, a value spell and high-rarity designs. This is an exploratory matched-slot check, not independent expert grading or a held-out sample.

## Completed result
All 1,080 slots are filled after one token-definition repair in the five-card arm. There are 105 real calls and $0.36448 estimated spend. Every initial set has duplicate names. Mean writing times are 76.8/65.9/63.0/62.9 seconds for 5/15/30/45 respectively; 45 lowers writing cost and duplicate-name counts but gives no established power-quality improvement. Repeated judges disagree substantially and miss a manually confirmed nonfunctional sorcery. Keep 15 as the app default; 45 is the best challenger for another world and the 270-card profile.

See [the complete study](../../research/limited-set-design/12-generation-batch-sizes.md) and `.artifacts/batch-size-eval-v1/summary.json`. All calls, inventories, review findings and matched samples are saved. The partial-resume smoke check additionally verifies that cached partial-arm timing is excluded from comparisons. All real candidate timings were uninterrupted. Production behavior, pack collation and deployment are unchanged.
