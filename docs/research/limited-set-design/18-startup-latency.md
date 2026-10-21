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
