# Designing a set for Limited

Research date: 2026-10-14. Purpose: inform DraftGPT's [step 6 card-creation rebuild](../../specs/refactor-roadmap.md#step-6-card-creation).

The resulting [set-generation specification](../../specs/set-generation.md) owns the selected model allocation, proposed implementation defaults, work packages, and acceptance criteria. This directory remains the supporting research.

Wizards designs the environment that cards inhabit: which decks can exist, how players discover them, what resources those decks compete for, and how playing them expresses the world. Individual card designs make that environment tangible. A list of interesting cards, or even ten appealing archetype names, does not establish a functioning draft format.

This directory studies that process through Wizards' own design articles, published handoff documents, art-direction accounts, and release guides. It covers ordinary two-player Limited; Commander Draft, Cube, and other products appear only where they illuminate a relevant distinction.

## Reading order

| Document | Questions answered |
|---|---|
| [01 — Process and validation](01-process-and-validation.md) | Who designs what? How does a set move from an idea to a tested environment? |
| [02 — Colors and archetypes](02-colors-and-archetypes.md) | What are archetypes? What do the ten pairs do? How do identities overlap? |
| [03 — Skeleton, distribution, and balance](03-skeleton-and-distribution.md) | How do curves, rarity, fixing, removal, and booster composition make decks possible? |
| [04 — Mechanics and novelty](04-mechanics-and-novelty.md) | How are new features chosen, supported, explained, and cut? |
| [05 — Worlds and aesthetics](05-worlds-and-aesthetics.md) | How do story, factions, names, art direction, and gameplay become one identity? |
| [06 — Case studies](06-case-studies.md) | How do actual sets implement or depart from the defaults? What went wrong? |
| [07 — Implications for DraftGPT](07-draftgpt-implications.md) | Where do our current prompts differ? What should a future design pipeline investigate? |
| [08 — Model costs and generation workflow](08-model-costs-and-generation-workflow.md) | What would half/full sets cost with Luna and Sonnet 5.5? How could JSON planning, parallel jobs, decision models, and revision work? |
| [09 — Concrete prose and card power](09-concrete-writing-and-power.md) | How do physical descriptions carry subtext, and why did the first cards undershoot the power target? |
| [10 — Modern Horizons power references](10-modern-horizons-power.md) | Which real cards are too strong, on target, or too weak across four rarities and six types? |
| [11 — Luna prompting and evidence tools](11-luna-prompting.md) | What does October 2026 guidance support, and how do prompts, reference selection and local evals work? |
| [12 — Generation batch sizes](12-generation-batch-sizes.md) | How do batches of 5, 15, 30 and 45 compare on writing time, cost, repairs, naming and review findings? |
| [13 — Creative seeding pilot](13-creative-seeding-eval.md) | How do concrete seeds, professional perspectives and broader slot jobs compare independently and together in fifteen-card samples? |
| [14 — Fantasy baseline versus all three](14-fantasy-comparison.md) | How do five fresh worlds per mode and their fifteen-card previews compare under the shared high-fantasy policy? |
| [15 — World directions and literal prose](15-world-directions.md) | Can broader structural questions and recent-use rotation reduce repeated premises while preserving literal descriptions? |
| [16 — Busted power](16-busted-power.md) | How does the selectable powered-cube target use a separate, sourced 1,000-card pool? |
| [17 — Release validation](17-release-validation.md) | What happened in complete-set evaluations, reviewer calibration, twelve world probes and 126,000 simulated packs? |
| [Sources](sources.md) | Primary-source reading list, publication years, evidence types, and limitations. |

Chapter 8 includes a [JSON design questionnaire](set-design-questionnaire.json) and a [reproducible cost calculator](estimate-costs.py). Its model pricing sources are cited in the chapter; the sources index covers Wizards design research.

For a short route, read this page, the color-pair table in chapter 2, the case studies, and chapter 7.

## Findings to carry forward

1. **Archetypes describe play patterns.** A useful description explains what a deck does early, what it accumulates, how it converts that resource into a win, and what can disrupt it.
2. **Ten pairs are a default, not a mandate.** Some sets emphasize five factions, three-color decks, or monocolor incentives. The support structure must match the chosen shape.
3. **Overlap creates draft decisions.** Cards that help neighboring strategies let players change direction. Completely isolated themes make picks predictable; universally efficient cards can make themes irrelevant.
4. **Availability is part of design.** A mechanic needs enough accessible enablers and rewards. Rarity labels and a balanced-looking card list cannot substitute for examining the packs and decks players actually receive.
5. **Novelty has costs.** New mechanics consume card slots, rules attention, and sometimes physical bookkeeping. Familiar effects can acquire new meaning through an unusual setting or combination.
6. **Creative identity is specific.** Materials, silhouettes, social roles, environments, and recurring motifs communicate a world more effectively than a generic genre label.
7. **Iteration remains necessary.** Published design intentions are not evidence that every released archetype was equally successful.

These are research conclusions synthesized across the linked chapters, rather than a quoted Wizards checklist. Particularly useful starting sources are [Limited themes](https://magic.wizards.com/en/news/making-magic/nuts-bolts-12-part-2-limited-themes-2020-03-16), [the Play Booster skeleton](https://magic.wizards.com/en/news/making-magic/nuts-and-bolts-16-play-boosters), and [Creating the Art of Innistrad](https://magic.wizards.com/en/news/feature/creating-art-innistrad-2011-09-05).

## How to interpret the evidence

**Wizards practice** is supported beside the claim with a primary-source link. **Synthesis** combines those observations into a useful design model. **Proposal** identifies a possible DraftGPT adaptation; it is not an implemented feature or approved specification. Invented examples are labeled.

Historical documents retain their context. The 2021 skeleton predates Play Boosters; the 2024 skeleton explains that transition. A 2017 organizational schedule is not presented as today's staffing calendar. The 2026 playtesting article provides a more recent process account. The 2021 mechanical color pie explicitly describes itself as a dated snapshot, not an immutable rules document.

Release guides establish intended strategies. Handoffs establish what designers proposed before later changes. Retrospectives establish the author's reported lessons. None alone establishes measured win rates, optimal draft picks, or the full contents of Wizards' internal playtest data.

The original design research is advisory. Later evaluation chapters record implementation experiments, their failures and local engineering evidence; they do not establish production validation or human format acceptance.
