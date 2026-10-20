# Creativity interventions in fifteen-card samples

Date: 2026-10-20. Status: complete historical prompt-7 experiment. Human feedback subsequently selected all three interventions with a stronger fantasy direction; application prompt 8 implements that preference.

## Question and protocol

Can concrete starting ingredients, a working perspective, or broader slot jobs produce different worlds and card designs while preserving the Modern Horizons power target? This pilot uses all eight combinations of three interventions, twice: sixteen new fifteen-card samples, 240 requested designs. Each sample has a fresh complete world/archetype blueprint and a fresh plan for the same fifteen fixed slot contracts. No previous card designs are shown.

| Factor | Stage changed | Exact intervention |
|---|---|---|
| S: world seed | World brief | Add a terrain, physical process, livelihood and tangible conflict; ask for one coherent physical dependency. |
| P: professional perspective | World brief | Ask for observations through one working profession while retaining the whole world and ten archetypes. |
| J: broad slot jobs | Slot planning | Ask for contribution, useful floor and resource relationship without prescribing an exact effect recipe; avoid unnecessary mandatory mechanic assignments. |

The arms are baseline, S, P, J, SP, SJ, PJ and SPJ. The same player ideas, fifteen slot constraints/order, model, reasoning, concrete writing policy, power target, reference-selection policy and validation apply throughout. The J factor bundles broader role language with more discretionary mechanic assignment; it cannot isolate their individual effects. Retrieved references adapt to the resulting roles.

Every sample has ten commons, four uncommons and one rare, with all five colors and all six supported types represented. These are deliberate samples from planned 135-card worlds, not collated boosters or complete draft environments. Slots are C001, C007, C013, C029, C045, C019, C021, C057, C033, C065, U006, U011, U025, U029 and R012. The fixed fields include type, colors, rarity, mana bands and archetype membership; effects, names, motifs and planned roles vary.

A saved application shuffle selects coherent seed bundles and professional perspectives from small versioned pools. All enabled arms in a repeat receive the same ingredients/perspective. Repeat 1 uses limestone orchard terraces, wet fibers that stiffen into lift cords, and a field naturalist. Repeat 2 uses an inland salt basin, wells surging after distant storms, and a canal engineer. Ingredients and perspective differ between repeats: this measures the chosen policy, not one fixed seed or all possible seeds.

The brief, slot plan and card generation use GPT-6 Luna with low reasoning; each sample receives one fresh medium-effort review. No temperature/top_p changes, Decisions, art, or gameplay editing occur. The reviewer sees the resulting blueprint, slots and cards, but no treatment labels, seed/perspective inputs or previous feedback. It is explicitly restricted to the supplied sample. Review flags are unverified model observations, not defect ground truth, balance scores or a novelty ranking.

Partial card responses use the shared structural repair planner, with at most two retries. Accepted cards are preserved and their names reserved. All calls, including failures, are recorded; no aesthetic rerolls occur. A resumable ledger reserves estimated cost before dispatch, capped at $3 with concurrency four.

## Interpretation

Two repeats and one player-idea bundle are exploratory evidence. Each arm gets a fresh stochastic blueprint, including arms whose brief prompt is identical; the J comparison is not a within-world paired card-writing experiment. Different names and scenery do not establish different play. The report compares matching slots using exact signatures (mana cost, type, subtype, legendary status, stats and rules, replacing self-name references) and rules-word Jaccard overlap. These are lexical diagnostics. Lower overlap can coexist with worse or incoherent cards; repeated basic interaction can be necessary. Whole-archetype support, final edited quality and player experience cannot be established from fifteen cards.

Fresh review errors and disagreement remain possible; the HTML keeps model observations collapsed so human readers can inspect the cards first. Promoting a production default requires broader seeds/inputs, complete sets and human judgment.

## Completed results

All **240 slots are filled** and every sample has unique card names within that sample. First-pass card acceptance is **239/240**. One card, C001 in SJ repeat 1, used `{1}` instead of including its required white mana; the shared repair planner corrected that one slot while preserving the other fourteen. Two world briefs required retries for invalid archetype neighbors. There were no transport failures, unfinished slots or image requests.

All sixteen sample reviews completed on the first attempt. They took 25.1–90.6 seconds each. Total usage is **67 requests** (18 briefs, 16 slot plans, 17 card-writing requests, 16 reviews) and **$0.17183 estimated text cost**. These are repository token estimates, not invoice reconciliation. The normal application remains unchanged.

| Treatment | Exact matched-slot repeats | Mean rules-word overlap | Major/blocker-flagged cards, repeats 1 / 2 |
|---|---:|---:|---:|
| Current prompts | 0/15 | 38.5% | 4 / 2 |
| World seed | 0/15 | 33.1% | 1 / 4 |
| Professional perspective | 0/15 | 37.6% | 4 / 1 |
| Broad slot jobs | 1/15 | 46.8% | 1 / 3 |
| Seed + perspective | 1/15 | 41.2% | 2 / 1 |
| Seed + broad jobs | 0/15 | 46.6% | 3 / 2 |
| Perspective + broad jobs | 1/15 | 38.0% | 1 / 1 |
| All three | 0/15 | 44.0% | 1 / 3 |

The counts are diagnostics, not a ranking. Broader slot jobs did not consistently lower lexical overlap in this small sample. References change with the planned roles, and the stochastic blueprints differ across arms; the study does not isolate why any particular card recurred or changed.

Both independently generated baseline worlds are named **The Siltward**. Across all sixteen samples, there are fourteen unique world names; SP repeat 2 also uses The Siltward. Concrete seed ingredients visibly shape the orchard/lift versus salt-basin/well settings, but **12/16 U006 blue-red signposts mention a second-spell condition**. That is a useful inspection target, not proof that all twelve cards play identically.

Manual checks also find issues that diversity controls do not solve. J repeat 2's R012, Surveyor's Worktable, checks whether a cast spell is a land card; the reviewer flags this. PJ repeat 2's C001, Sereford Gate Tender, prints “Landfall — This creature gets +1/+0 until end of turn” without an event triggering that bonus; its review mentions only the card's personified flavor prose. Reviewer findings must remain evidence for human inspection, not ground truth. Original card text is preserved in the HTML; no review-driven gameplay edits were applied.

**Initial decision:** the measurements alone did not justify promoting a winner. **Subsequent human decision:** the user preferred all three together but rejected the mundane settings. [Prompt 8](../../specs/set-generation.md#fantastic-worlds-and-combined-creativity-default-2026-10-20) adopts the combined pattern with supernatural seed ingredients and perspectives, and concrete magical conflicts. This is preference feedback, not a statistical ranking. Further tests should reuse fixed blueprints when isolating slot-job changes, vary more player inputs and seed families, and measure mechanical/archetype diversity beyond lexical overlap. Some conventional interaction and color-pair themes should recur; novelty should not override playability.

## Reproduction and artifacts

```sh
bun --env-file=.env.local scripts/evaluate-creativity.ts .artifacts/creative-seeding-eval-v1
python scripts/creativity-eval/render.py .artifacts/creative-seeding-eval-v1/comparison.json
```

The output directory contains the frozen protocol, selected ingredients, exact prompt additions, code hashes, usage ledger, call records, sixteen sample files and `comparison.json`. Under the original prompt-7 source, re-running the same command reuses checkpoints; changed inputs or code hashes are rejected. The runner now rejects generation under prompt 8: broad jobs are already the default, so the old factorial labels would be misleading. The renderer still works on the saved comparison. A future experiment needs a new controlled protocol, including updated seeds and matched fantasy expectations. The report works offline, displays all cards and their token definitions, supports matching-slot comparisons and local review notes, and can hide treatment labels in the card views. The methodology and measurements still identify treatments.

The prompt override is optional and used only by the evaluation runner. It is included in both the actual request and recorded reservation/context. A fake-service integration test verifies partial-batch repair, prompt isolation, request auditing, checkpoint reuse and unchanged default requests. The full suite contains 121 passing tests; typecheck and lint pass, including an explicit lint of the new scripts. A complete fake-service smoke run produced all sixteen samples and reviews in 64 requests. The final 576 KB HTML passed checks for all 240 unique card records, sixteen samples/reviews, balanced markup, unique IDs, valid local links and JavaScript syntax. It requires no external assets. These are lightweight checks, not browser visual inspection.

Research motivating the treatments: [remote concept infusion](https://arxiv.org/abs/2601.18053), [professional-persona design ideation](https://doi.org/10.1017/dsj.2025.10037), and [Luna reasoning/sampling compatibility](https://developers.openai.com/api/docs/guides/latest-model). These sources motivate the pilot, not its measured outcomes. Alternative concept selection, reference rotation, history-based rejection, Verbalized Sampling and temperature changes are not tested here.
