# Release validation: complete sets and reviewer calibration

Date: October 20–21, 2026. **Engineering checks pass; model-quality acceptance does not.** Four candidates reached a terminal outcome, and all four were blocked. Two additional runs were interrupted during review. Failed candidates remain saved and the app's publication gate remains enforced.

This closes the planned measurement work, not the quality milestone. Human playtesting was excluded. The offline comparison is `/tmp/draftgpt-release-validation-20261021.html`; raw evidence is under `.artifacts/` and is intentionally not committed. The report contains all 1,215 saved designs, six diagnostic packs, exact review issues, blueprints, calibration outputs and distribution metrics.

## Method and outcomes

The CLI uses the application planner, parser, partial-batch repair, review policy and collation. Writing batches contain fifteen slots, four concurrent workers per candidate. World/slot planning precedes writing; ten pair reviews and a global review precede coordinated edits and final review. Source hashes, versions, seeds, task payloads, parsed responses, timings and cost reservations are saved. This bypasses Convex scheduling and does not measure production latency.

| Prompt / mode / size | World | Time to outcome | Text estimate | Edited slots | Outcome |
| --- | --- | ---: | ---: | ---: | --- |
| 10 / Default / 135 | The Borrowed Crown | 10.95 min | $0.1369 | 0 | Editor declared the blueprint broken over an undefined heart-transfer procedure; also duplicate names |
| 10 / Busted / 135 | The Inheritance Roads | 12.52 min | $0.1769 | 41 | Final review retained three major issues, including demonstrably stale sacrifice-cost evidence and invalid sunrise advice |
| 10 / Default / 270 | The Unpinned Court | Excluded | $0.2184 | 0 | Interrupted during review; all initial designs saved |
| 10 / Busted / 270 | The Borrowed Crown | Excluded | $0.2750 | 0 | Interrupted during review; all initial designs saved |
| 11 / Default / 135 | The Long Molt | 16.23 min | $0.2089 | 36 | Final review reported seven missing-mechanic contracts; one proposed correction incorrectly adds Flashback to a creature |
| 11 / Busted / 270 | The Severed Accord | 13.92 min | $0.2746 | 60 | Prior gameplay repairs accepted by the critic, but two exact name collisions remain |

Prompt 11 is a labeled intervention, not a matched statistical comparison. It separates fictional events from executable rules, removes stale evidence prose from final-review inputs while preserving issue IDs/corrections, and supplies repeatable and one-shot fast-mana references. Original results were not replaced. Default's follow-up includes a 150-second HTTP 502 followed by a successful retry. Partial writing repairs retained accepted cards and narrowed the remaining task.

The two interrupted runs retain eight uncertain request reservations; their wall times are excluded and they have no final model verdict. No in-flight requests were silently replayed. Across candidates and probes, the recorded text estimate is **$1.3589**, including **$0.2893** in pending reservations and other conservative allowances for uncertain failures. This is not an invoice. The $26 study ceiling was not approached.

Both follow-up diagnostic packs received **15/15 images**: Default in 47.7 seconds and Busted in 42.3 seconds, each with a shared 90-second deadline and four workers. Image allowance is $0.60 per pack at one attempt, up to $3.60 per pack with six attempts; the adapter does not report actual billable usage or attempt counts. Art success does not approve a failed set. Busted's diagnostic pack is separate from its empty publishable-pack field.

## What the reviewer actually learned

Twelve fresh fixtures were reviewed twice per power mode. The original four calibration requests contained a test-harness mistake: `{0}` became a fixed one-mana slot. The reviewers correctly flagged the contradiction. Those outputs are preserved, excluded from mode-calibration claims, and followed by four fresh requests with corrected metadata and parser preflight. Expectations never appeared in provider requests.

In the corrected samples, four clear defects were found for their intended reasons in **16/16 opportunities**: a six-mana 1/2 vigilance creature, an omitted assigned Flashback ability, an undefined `ashbind` action, and a zero-mana one-sided spell/ability/combat lock. This tiny sample is not a population accuracy estimate.

The reviewers counted discard costs and delayed artifact activation costs in all four samples. Floor complaints about those cards are not false positives merely because they were intended as full-cost controls. Likewise, objections to an eight-mana reanimation target or a 0/7 defender are subjective rate judgments unless the evidence misstates their actual text.

Two useful failures remain:

- The undefined-X fixture is excluded from the detection score. Its editorial expectation was too strong, and all reviewers repeated it. The current rules permit choosing X when it appears in text without a cost; “no executable threshold” is not a justified conclusion here. Flashback also cannot simply make a creature recastable: the resulting spell must be an instant or sorcery. See rules 107.3f and 702.34a in the [September 25 Comprehensive Rules](https://media.wizards.com/2026/downloads/MagicCompRules%2020260925.txt).
- One Busted review says `{2}{R}` Flashback is less efficient than Firebolt, whose frozen reference has `{4}{R}`. Creature-only targeting is a real restriction, but the cost comparison is false. Reviewers still need factual comparison checks.

The Lotus-equivalent fixture was treated as excessive fast mana in both Default samples. Both Busted samples explicitly allowed that power and rejected the exact renamed copy under the originality policy. That establishes mode recognition, not unconditional acceptance of the fixture.

A separate two-repeat regression probe used five observed development failures, not held-out cards. Both repetitions recognized the repaired sacrifice cost, removed the undefined eating instruction while retaining game-turn timing, and stopped claiming that any-creature targeting is intrinsically invalid. Neither repeated the impossible-after-blockers claim. One correctly noticed that a mandatory blocker target prevents flexible protection outside combat. The repeatable two-mana artifact still received inconsistent treatment: one pass and one sacrifice demand. This is not a solved calibration problem.

## World diversity and player ideas

All twelve input bundles produced structurally valid blueprints on the first attempt and retained Default power. The instruction-like input did not replace the response with BANANA, weaken the target or disclose a credential. The key is never supplied in the prompt.

Every premise contained observable supernatural causes: species calls changing habitats, a continent on a flying creature, transforming stone fittings, weight transfer, age transfer, a demon sun, gemstone breath, stellar titan eggs, spell-eating birds, lightning-powered clay bodies, heat-eating animals, and coordinated rhythms inside a sea monster's mouth. The dry-ocean contradiction became moving glass grains.

However, at least nine conflicts still revolve around rulers, courts, keepers or registries controlling a magical resource. Veyra/Veyr/Veyrun-style names recur, and several different directions converge on transferring bodily traits. The merchant and friendly-city inputs especially preserve the institutional framing the user criticized. The prose is generally literal, but these results do **not** establish adequate creative diversity.

The “no artifacts” input produced a promise of an artifact-free pool, which conflicts with the application's fixed artifact slots. This is a brief-level promise, not an implemented skeleton constraint. Ideas cannot silently override the supported profile. Keep this example in the next contract evaluation.

## Pack exposure

Nine configurations, each with 1,000 seeds and three rounds, checked **126,000 packs**. Every pack contained fifteen distinct slot IDs, ten commons, four uncommons, one rare/mythic, and a monocolor common of each color. Repetition across packs is intentional. Diagnostic simulation includes rejected and interrupted inventories and does not bypass their gates.

| Inventory / players | Cards dealt | Median unique designs | 5th–95th percentile unique | Median repeated copies | Median fixing lands | Mythic packs |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| 135 / 2 | 90 | 66 | 61–71 | 24 | 6 | 12.63% |
| 135 / 4 | 180 | 96 | 90–102 | 84 | 12 | 12.31% |
| 270 / 8 | 360 | 190 | 182–198 | 170 | 12 | 12.56% |

These exposure counts match across the tested inventories because the skeleton and seed sequence match; they do not measure comparable card quality. Follow-up Busted still produced **128 of 24,000** diagnostic packs containing repeated names on distinct slots. Follow-up Default had none. Earlier invalid inventories show additional name collisions in the detailed report.

A given pair's fixing is absent from roughly 52–56% of two-player pods and 27–31% of four/eight-player pods in these samples. Total fixing does not guarantee each pair sees its own land. Pair support uses assigned slots; removal/enabler/payoff counts use text proxies. None measures actual picks, assembled decks, wins or balance.

## Implemented hardening and engineering checks

Paid evaluations used pipeline 2 / prompt 11 / rubric 5 / references 4. Afterward, **pipeline 3** added two deterministic safeguards: same-response duplicate names preserve the first valid card and repair subsequent collisions; revision planning always re-adds current duplicate-name issues even if the model editor drops them. Two public integration tests reproduce the failures. Concurrent revision batches can still invent the same new name; final inventory validation continues to block those results.

Vitest now blocks unmocked network calls, including after a mock is restored. The fixture preflight validates every card's slot, including zero mana. Saved inventories are re-parsed after stripping storage-only image fields; the full audit exposes parser failures, name groups, mechanical duplicates, curves and mechanic observations.

**136 tests pass**, along with typecheck, lint, script lint and the production build. Browser acceptance covered the Busted host/guest controls and a mana keyboard-shortcut fix in two local player sessions. Eight-player integration coverage completes 45 picks per player from a single inventory, producing 360 independent card instances without additional model calls. These are engineering checks with fake external services, not human format playtesting.

## Release decision and remaining gates

Keep automatic final rejection. Do not deploy under a claim that quality acceptance passed. The next quality work needs valid mechanic assignments/corrections, a bounded strategy for cross-batch rename collisions, factual reference comparison, and a world test that penalizes repeated institutional premises. Repeating whole candidates until one happens to pass would hide the current failure rate.

Production credentials and model access were checked read-only. Domain registration is pending DNS/certificate verification; the legacy Firestore export remains preserved. Deployment requires explicit approval, DNS work needs zone access, and a real production draft needs authenticated Google sessions. The [release handoff](../../plans/active/production-release.md) records these external steps. No production code was deployed and no old decks were imported.

## Reproduction

Paid commands require `.env.local`, the real key and an explicit official API base. Use fresh directories after changing source or fixtures; never delete uncertain ledgers merely to retry.

```sh
OPENAI_BASE_URL=https://api.openai.com bun --env-file=.env.local scripts/evaluate-release.ts .artifacts/new-release
OPENAI_BASE_URL=https://api.openai.com bun --env-file=.env.local scripts/evaluate-release.ts .artifacts/new-followup --acceptance
OPENAI_BASE_URL=https://api.openai.com bun --env-file=.env.local scripts/release-eval/probes.ts .artifacts/new-probes
OPENAI_BASE_URL=https://api.openai.com bun --env-file=.env.local scripts/release-eval/calibrate.ts .artifacts/new-calibration
```

The current report is reproducible offline:

```sh
python scripts/release-eval/assemble.py
bun scripts/release-eval/packs.ts .artifacts/release-report-20261021
bun scripts/release-eval/distribution.ts .artifacts/release-report-20261021
bun scripts/release-eval/inventories.ts .artifacts/release-report-20261021
python scripts/release-eval/render.py .artifacts/release-report-20261021 .artifacts/release-probes-v11 /tmp/draftgpt-release-validation-20261021.html
```

The study follows the separation of evaluation evidence from model assertions described in [OpenAI's evaluation guidance](https://developers.openai.com/api/docs/guides/evaluation-best-practices). Costs use the configured Luna token rates; see the [model documentation](https://developers.openai.com/api/docs/models/gpt-6-luna). Actual billing, production wait times, human preference and format balance remain separate measurements.
