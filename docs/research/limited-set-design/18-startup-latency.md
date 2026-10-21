# Startup benchmark with no reasoning for world, writing and critique

Date: October 21, 2026. Source: `2e92355`, pipeline 6 / prompt 13 / schema 3 / rubric 6. One fresh Default-135 candidate, **The Moltbound Marches**, using the shared application planner, provider adapter, parsers and repair logic. No application code changed during this benchmark.

**Result: 14 minutes 36 seconds of text processing, $0.2268832, 55 requests.** The complete 135-card inventory passed structural validation and the final model gate, with two minor issues and no major/blocker issues. It missed both the 15-second world/planning target and the 180-second draft-start target. This is model/structural acceptance, not human quality approval or a production draft.

## Protocol and limits

The benchmark used `gpt-6-luna`, an empty lobby conversation, direction/reference seed `202610335`, four concurrent jobs, fifteen-card writing/revision batches and a $5 maximum text budget. World, slot planning, writing, pair/global critique and edit planning used `none`; revisions and final verification used `medium`. Intent interpretation was not exercised because there were no player messages. All calls through edit planning reported zero reasoning tokens.

This measures the existing eleven-critic workflow and separate editorial plan. The proposed compact combined critique, local slot expansion, increased concurrency and background art are not implemented. Timing includes bounded repairs, but excludes art, Convex scheduling and browser delivery. The benchmark intentionally continued beyond 180 seconds to diagnose the full critical path. No fresh-candidate rerolls or checkpoint resumption occurred; all frozen source hashes still matched after completion.

One run cannot establish typical latency, p95, a quality success rate, or the causal effect of reasoning settings. Earlier runs used different worlds and some different contracts; they are not a matched control. The 12.17-minute Busted-270 run was review-only and must not be treated as the end-to-end baseline for this 135-card result.

## Timing and requests

| Stage | Elapsed | Calls | Repair calls beyond initial jobs |
| --- | ---: | ---: | ---: |
| World brief | 75.8 s | 2 | 1 |
| Slot planning | 187.0 s | 16 | 7 |
| Initial card writing | 55.7 s | 11 | 2 |
| Ten pair critiques plus global critique | 188.5 s | 15 | 4 |
| Editorial plan | 49.0 s | 1 | 0 |
| Card revisions | 158.9 s | 9 | 0 |
| Independent final check | 161.1 s | 1 | 0 |
| Total | 876.0 s | 55 | 14 |

World plus slot planning took **262.8 seconds**, versus the proposed combined allocation of 15 seconds. Even the first brief response alone took 43.1 seconds and did not validate. Card writing filled all 135 slots in 55.7 seconds including repairs; increasing batch size is not the first priority suggested by this run.

## What caused extra work

The first world brief referenced a nonexistent player idea and failed with `Unknown idea reference`. The accepted repair took 32.7 seconds. The two responses emitted 3,212 and 2,939 output tokens, respectively, with zero reasoning tokens. Removing reasoning does not remove the time needed to produce the current verbose world contract.

Slot planning produced four invalid-JSON responses and three incomplete responses, requiring seven repair calls. One slot job needed both of its allowed repairs. These failures are preserved in the call records; no token-limit or schema settings were changed to rescue the run.

Initial writing had one invalid-JSON response and one partial batch: C045 lacked positive creature toughness. The shared repair path retained the fourteen accepted cards and requested only C045 again. All slots were eventually filled.

Four critics failed audit validation because they did not assign every issue to a dimension. Each passed after one repair. The whole-set reviewer and editor still receive all cards; these were audit-contract failures, not evidence that the five semantic dimensions were unimportant.

The editor produced fourteen issue groups. One minor group, `archetype-support-audit-limits`, asked for another support assessment after repairs and named all 135 cards. The planner treats every issue's slot IDs as rewrite targets, so that follow-up instruction selected the entire inventory for nine revision calls. The other groups selected 101 distinct cards; the general audit note added 34 more. All 135 replacement records were accepted, but only 116 records actually differed from their initial versions. A diagnostic follow-up should not automatically become a rewrite instruction.

Revisions consumed 39,946 reasoning tokens. Final verification consumed 19,140 output tokens, including 16,355 reasoning tokens, and received 67,729 input tokens. The final stage alone approached the entire three-minute budget. Those stages retained medium effort as requested; the benchmark did not silently reduce them.

## Final state

All 135 names were unique and inventory validation returned no problems. The final reviewer reported two minor groups: literal em-dash subtype fields on eight cards, and repeated blue eel/frill subjects on twelve cards. No final major/blocker issues remained, so `ready` was true and the benchmark process exited successfully. `readyWithinTextTarget` and `worldWithinTarget` were both false. No art was requested, no packs were published to a lobby, and no production deployment occurred.

## Next changes supported by this evidence

1. Shorten the world response and expand slot recipes locally. A compact world contract must preserve supernatural premise, ten distinct archetypes, mechanics and player input while avoiding hundreds of repeated slot instructions.
2. Put a required dimension directly on each issue and derive grouped audit references in code. Keep model evidence and pair assessments while removing duplicated bookkeeping that caused four repairs.
3. Distinguish concrete card edits from informational notes and review follow-ups. Continue allowing all cards to be edited when each is selected for an actual correction; do not impose a percentage cap.
4. Combine the critique and edit plan, increase bounded writing/revision concurrency, and compact the final contract. Preserve an independent full-set final check and measure its quality and latency before claiming the target is achievable.

These are proposed follow-ups, not speedups measured by this run. The live [startup plan](../../plans/active/three-minute-drafts.md) owns implementation status.

## Reproducibility

Artifacts: `.artifacts/startup-benchmark-p6-default-135/`. `config.json` freezes source hashes, versions, settings, seed and budget. `benchmark.ts` is the exact single-candidate harness importing the shared release-eval runner. `summary.json` contains target outcomes and stage timings. `default-135/initial.json` preserves original designs; `default-135/result.json` contains final designs, reviews, ledger, readiness and a diagnostic collated pack. `default-135/calls/` preserves every request, response parsing result, token usage and duration. Artifacts are ignored by Git; this report preserves the result in the repository.

## Follow-up: every stage configured with no reasoning

The user requested one run with `none` throughout, including revisions and final verification. An eval-only `Trial.reasoning` override was added; it reaches request execution, checkpoint metadata and repairs without changing application defaults. Tests cover both default and overridden efforts, a targeted revision, partial repairs, failed final gates, recorded settings and refusing completed-result reuse under a different effort. All three release-eval tests, typecheck, lint and changed-script lint pass.

This fresh Default-135 candidate used the same direction/reference seed, batch size, concurrency and contracts as the first benchmark. No pre-card world/archetype review was added during the comparison. The runner and all generation source hashes were frozen before dispatch and verified after completion. All 36 dispatched calls used `none` and reported zero reasoning tokens.

**Outcome: failed during critique after 321.7 seconds (5 minutes 22 seconds), costing $0.1072144.** All 135 initial card records were generated, but the complete inventory failed name uniqueness. Two pair critics exhausted their three allowed attempts. The runner drained in-flight work, preserved checkpoints and returned `ready=false`; it did not continue to editing or final verification. The global critic was not reached. No reroll or gate bypass was performed.

| Stage | Previous mixed-effort run | All-none run |
| --- | ---: | ---: |
| World brief | 75.8 s | 96.4 s |
| Slot planning | 187.0 s | 75.8 s |
| Card writing | 55.7 s | 53.1 s |
| Critiques | 188.5 s, completed | 96.4 s, failed before all critics ran |
| Editorial plan | 49.0 s | Not reached |
| Revisions | 158.9 s | Not reached |
| Final verification | 161.1 s | Not reached |
| Total | 876.0 s to automated acceptance | 321.7 s to failure |

The shorter failed run is not a speedup to a usable set. Both runs already used `none` through edit planning; the only changed settings were for revisions and final verification, neither of which the new run reached. Consequently this experiment provides **no measurement of the effect of disabling reasoning in those two stages**. Different sampled worlds, cards, repair counts and provider latency also prevent a causal comparison of the earlier stages.

The world, **The Unmoored March**, needed two repairs for invalid white-blue neighbor assignments before passing. Slot planning needed three repairs: two invalid JSON responses and one incomplete response. All nine writing batches filled fifteen slots on the first attempt. Six pair critics were dispatched; four eventually passed audit validation and two failed. Their twelve calls included five unassigned-issue audit failures, one repeated/unknown-evidence failure and two invalid JSON responses. There were eleven repair calls in total, and no unresolved in-flight reservations after completion. Successful partial critiques remain in call checkpoints even though the failed phase did not return an aggregate review array.

### Output inspection

The prose describes physical, observable magic: organs decay with use; a lung opens tunnels and a fin bends currents. It again centers on harvested animal parts, migration routes and a Crown controlling access. The earlier world shares those subjects. Because the direction seed was intentionally held constant, this is an observed similarity, not a general diversity evaluation.

Four names are reused across eleven card records: Causeway Crane Guide (C001/C026/C046), Kilnroad Salamander (C009/C029/C044), Ravine Glasswing (C047/U037/R017) and Reedbridge Crane Guide (U036/M001). There are 128 distinct names for 135 records. Initial per-batch acceptance did not establish a valid full inventory.

A qualitative spot check also finds a weak-looking mythic for the requested environment: M001 costs `{1}{W}` for a 2/2, gives another creature +0/+2 for one turn on entry, and gains one life when another creature survives combat damage. That is an editorial power-floor concern, not a measured win-rate conclusion. Partial model critiques contain other power and rules claims, but their semantic accuracy was not independently established. No completed final audit or human playtest exists for this candidate.

The offline comparison at `.artifacts/startup-benchmark-p6-all-none-135/comparison/index.html` links the prior edited pack and a clearly labeled **unedited diagnostic sample** from the new inventory. It includes both worlds, archetypes, cards and raw JSON. The new sample is collated only for inspection; the benchmark's original result retains an empty approved-pack list and `ready=false`. The page explicitly distinguishes time to acceptance from time to failure, and edited from unedited cards. Both samples contain fifteen records. Local links, card count and the index were checked in a browser with no browser errors; screenshot: `comparison/none.png`. The browser session was closed.

All new evidence is under `.artifacts/startup-benchmark-p6-all-none-135/`, including the exact benchmark harness, frozen config, calls, initial inventory, failed result and summary. No art, production changes or application-setting changes were made. The requested pre-card world/archetype review remains a separate next implementation, recorded in the startup plan. This failed attempt supports simplifying the review contract before another full benchmark; it does not support bypassing review or claiming that all-none output quality is acceptable.
