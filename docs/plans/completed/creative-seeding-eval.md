# Compare creativity interventions in fifteen-card samples

## Protocol fixed before calls

Date: 2026-10-20. Create sixteen new fifteen-card samples without art, with an HTML comparison for human assessment. Use a complete 2×2×2 factorial comparison of concrete world seeds (S), professional perspectives (P), and broad slot jobs (J): baseline, S, P, J, SP, SJ, PJ, SPJ. Repeat each twice. All arms generate a fresh blueprint from the same player ideas, plan the same fifteen slot constraints, and write one fifteen-card batch. No previous designs are supplied.

Keep Luna, low writing/planning reasoning, medium review reasoning, existing concrete prose, Modern Horizons references, and response contracts unchanged. S and P affect only the brief. J affects only slot planning. Within each repeat, seed ingredients and professional perspective are shared across enabled arms; the second repeat uses a second seed/perspective. This measures the selected intervention policy, not all possible seeds. Prompt additions and selection rules are persisted before real calls. No temperature/top_p experiment: changing reasoning mode would add a fourth factor.

Use ten common, four uncommon and one rare slot sampled deterministically from the 135-card skeleton, covering all five colors and all six supported card types. This is a designed comparison sample, not a collated booster or complete draft environment. All samples are intended as views into a 135-card world. The same skeleton/order is used in all arms; role/motif/mechanics are newly planned.

Use at most two structural repairs via the shared planner. Preserve accepted cards and reserve their names. Record partial batches, malformed responses, retries, duplicate names and missing slots; never silently reroll. No gameplay revisions, Decisions or image calls. Each sample gets one fresh review with no arm labels, seed, perspective or prior reviewer feedback; explicitly restrict conclusions to the sample. Model flags are unverified opinions, not rankings or playtest outcomes.

Persist all requests, rendered prompts, usage, returned artifacts, candidate results and run configuration under `.artifacts/creative-seeding-eval-v1`. Reuse the budgeted, resumable caller with a $3 estimated text ceiling and concurrency four. Inputs and code hashes must match on resume. Keep production defaults unchanged.

## Progress

- [x] Build and verify controlled prompt overrides, runner and structural-repair handling.
- [x] Generate all sixteen samples and independent sample reviews.
- [x] Compute transparent overlap diagnostics and inspect matched cards.
- [x] Write results and render a standalone comparison HTML; validate and open in Vivaldi.

## Acceptance

All 240 requested cards appear in the comparison or any unresolved failures are explicitly identified. The report shows all card text, tokens, sample world/archetype context, treatment definitions, first-pass acceptance, repairs, duplicate names, request cost and reviewer observations. Allow comparison of matching slots across samples and access to all samples. No external assets or server are required.

Diagnostics compare normalized rules/stat/cost/type signatures and simple rules-token overlap with names removed; they are lexical proxies, not a semantic or balanced-gameplay verdict. Two repeats, one idea bundle, changing seed/perspective between repeats, adapted reference retrieval, no playtests and noisy same-family review limit inference. No default winner is promoted from this pilot.

## Recovery

Restart the same command and directory to reuse recorded calls. Pending charged calls require inspection before any retry. Cached calls must not be presented as freshly measured latency. Keep failures and the ledger; use a new directory for any changed experiment.

## Completed outcome

All 240 cards and sixteen reviews are saved. First-pass acceptance is 239/240; one card repair and two world-brief retries give 67 requests and $0.17183 estimated spend. No inventory name collisions, transport failures, art requests or gameplay edits occurred. No prompt default is promoted. See [the study](../../research/limited-set-design/13-creative-seeding-eval.md). The standalone comparison is copied to `.artifacts/creative-seeding-eval-v1/index.html`; the user-facing copy is `/tmp/draftgpt-creativity-comparison-hd9vix9w.html`. It includes all cards, world/archetype context, sample reviews, matched-slot comparisons, optional hidden treatment labels and downloadable local notes. All 121 tests, typecheck, normal lint and script lint pass; the complete fake-service smoke and lightweight HTML/content checks pass.
