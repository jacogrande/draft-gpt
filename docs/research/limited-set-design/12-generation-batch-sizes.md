# Generation batch-size evaluation

Date: 2026-10-19. Status: complete. The app default remains at 15 cards per generation request.

## Question and controlled comparison

Does requesting more cards per call improve generation latency, cost, reliability or design quality? This experiment compares 5, 15, 30 and 45 requested cards, using two complete 135-card generations per size: 1,080 requested card designs in total.

Every candidate uses the same accepted Glass Inlet blueprint and 135 planned slots from `.artifacts/pack-preview-v7-review-only/set.json`. Writers never receive the previous card designs. Slot order, model (GPT-6 Luna), low writing effort, prompt/reference versions, reference retrieval policy and four-worker concurrency remain fixed. Each candidate runs alone. Candidate order is 15/45/5/30, then 30/5/45/15, to reduce temporal bias. Two repetitions and one world are exploratory evidence, not a statistically established optimum.

The existing response schema allows at most 15 cards. Evaluation-only options expand it to the number requested, and allow `max(14000, ceil(14000 × requested_slots / 15))` output tokens. These test viable configurations rather than forcing large batches through a 15-card contract. The largest observed writing output was 6,866 tokens, below even the existing 14,000-token limit; no response was truncated. Normal app settings remain unchanged.

Each batch receives at most two structural repairs through the shared repair planner. Accepted cards and names are preserved. Gameplay editing, new world/slot planning, Decisions, illustrations, collation and drafting are excluded. The measured time is card generation plus structural repair, not end-to-end player waiting time. Reference retrieval still adapts to each batch's slots under the same 48-reference cap; this measures changing batch size in the actual prompt pipeline, not isolating attention effects from reference composition.

## Generation measurements

| Cards/request | Requests per 135-card set before repairs | Run times | Mean generation time | Mean estimated generation cost | Initial slot acceptance across both runs | Repair requests | Cards with duplicate names, by run |
|---:|---:|---|---:|---:|---:|---:|---|
| 5 | 27 | 77.4s / 76.1s | 76.8s | $0.02864 | 269/270 | 1 | 15 / 17 |
| 15 | 9 | 71.4s / 60.4s | 65.9s | $0.01873 | 270/270 | 0 | 14 / 19 |
| 30 | 5 (last has 15) | 62.3s / 63.7s | 63.0s | $0.01688 | 270/270 | 0 | 14 / 17 |
| 45 | 3 | 66.1s / 59.7s | 62.9s | $0.01501 | 270/270 | 0 | 10 / 8 |

All eight candidates ultimately fill all 135 slots. Per-card structural acceptance does not mean a valid complete set: every candidate has duplicate names across distinct slots. The five-card second run needed one repair for U001's missing token definition. There were no generation transport failures or timeouts.

Compared with 15, the mean writing-time improvement is about three seconds for either 30 or 45. The 15-card baseline itself varies by eleven seconds across repeats. Thus this experiment does not establish a robust latency advantage for either larger size. Forty-five costs about 20% less for this generation stage, a saving of approximately $0.0037 per 135-card set under the repository estimator. These estimates use recorded token counts and the repository's rates; they are not invoice reconciliation or cache-discount accounting.

The 45-card candidates have fewer duplicate-name cards in both runs. This is an observed naming-cohesion advantage, not evidence of balanced gameplay. Neither candidate has globally unique names, and the first includes a collision within a single 45-card response.

## Quality evaluation

Each candidate receives two fresh medium-effort whole-inventory reviews with the same rubric and slot order. Reviewers receive no batch-size labels, earlier reviews or generation error counts. Review calls are separate but use the same Luna model family; their errors may be correlated. Reported major/blocker counts are unverified findings, not ground-truth defect counts or playtest outcomes.

All sixteen reviews completed without retries. Counts below are the number of unique cards receiving at least one major/blocker issue. Minor issues are recorded separately in the JSON artifacts.

| Cards/request | Run 1: two reviewers | Run 2: two reviewers | Mean flagged cards per review |
|---:|---|---|---:|
| 5 | 13 / 15 | 9 / 6 | 10.75 |
| 15 | 22 / 8 | 27 / 33 | 22.50 |
| 30 | 12 / 11 | 12 / 20 | 13.75 |
| 45 | 17 / 6 | 7 / 23 | 13.25 |

These scores do not establish a quality ranking. Two reviewers flag 7 versus 23 cards in the same second 45-card candidate. Both reviewers miss the nonfunctional R006 sorcery in the first 15-card candidate, and the reviews do not consistently identify or grade the deterministically known duplicate names. Lower counts can reflect missed defects or different severity judgments. The five-card arm has the lowest average model score despite producing the two-mana unconditional board wipe in the manual sample.

Individual global reviews take 104.7–179.5 seconds. In this experiment, even one full-set review takes longer than writing all 135 cards with any tested batch size. This supports investigating review accuracy and latency before expecting batch-size tuning to substantially reduce the initial wait; it does not measure the full application pipeline.

## Fixed manual sample

The matched sample is C001, C019, C062, U001, U025, U026, R006 and M001 across all eight candidates, saved as `manual-sample.json`. These are exploratory comparisons selected for their roles and known development problems, not a held-out benchmark or independent expert grading.

- **C062:** every arm produces essentially the same `{2}{U}` sorcery: tap a creature, investigate, and mill two. Larger batches do not redesign this weak role. The frozen slot explicitly asks for those three jobs, which is a plausible source of this repeated design; this is an inference, not an experimentally isolated cause.
- **C001:** the 15-card runs produce a `{W}` 1/2 with a temporary +0/+1 bonus for another creature. The 45-card runs produce a `{W}` 2/1, with vigilance in the first and an entry +1/+1 bonus in the second. This individual slot improves in the larger batches; it does not establish an overall power improvement.
- **R006, 15-card run 1:** a sorcery destroys an attacking creature, or all attackers after reaching five lands. It lacks an ordinary main-phase use. Both independent global reviews miss this defect.
- **R006, 5-card run 1:** a two-mana sorcery offers either exile of a tapped creature or unconditional destruction of all creatures. Smaller batches do not prevent excessive rates.
- **C019:** Equipment varies between bonuses such as +1/+1, an extra attack bonus, trample, or a sacrifice-dependent menace ability. Increasing batch size does not consistently improve its rate.

These observations argue against treating the response batch size as a solution to the power-target or rules-reliability problem.

## Decision

Keep the app at 15 for now. Forty-five is the strongest challenger for a follow-up across different worlds and a 270-card inventory: it lowers writing cost and duplicate-name counts without an observed structural reliability penalty. Thirty provides essentially the same timing as 45 with a smaller cost improvement. Five has no demonstrated advantage here and increases time, repeated input and estimated cost.

There is no evidence here for a large startup-latency win, and no reliable power-quality winner. Before promoting a different default, repeat on a second frozen setting, include the 270-card profile, and evaluate whether fewer initial defects actually reduce editing work. The fixed manual sample identifies reviewer misses that need calibration regardless of batch size. A single 135-card request was not tested.

Total estimated spend was **$0.36448**: **$0.15851** for generation/structural repair and **$0.20597** for sixteen reviews. There were 105 real requests: 88 initial writing requests, one structural repair, and sixteen reviews. No art requests were made.

## Reproduction and artifacts

```sh
bun --env-file=.env.local scripts/evaluate-batch-sizes.ts \
  .artifacts/pack-preview-v7-review-only/set.json \
  .artifacts/batch-size-eval-v1
```

The runner enforces a $3 estimated text budget, persists pending reservations before dispatch, and saves tasks, rendered prompts, options, durations, token usage and request IDs. It resumes saved calls without rerolling failures. Completed-candidate timings are preserved; reconstructing a partially completed candidate from cached calls marks its wall time unsuitable for comparison. No real candidate in this run required resumption.

Artifacts include `config.json`, `ledger.json`, `calls/`, eight candidate JSON files, `manual-sample.json`, `reviews.json` and `summary.json`. Artifact files are ignored by Git. Software checks: 120 tests, typecheck, lint and a fake-service smoke run, including injected partial output and checkpoint resumption. A final resume rebuilt the report using saved results and left the ledger at 105 calls. No new app screens or production deployment are involved.

The evaluation methodology uses task-specific metrics, repeat observations and human checks, consistent with [OpenAI's evaluation best practices](https://developers.openai.com/api/docs/guides/evaluation-best-practices). The measurements and card observations above come from this repository's run, not from that guidance.
