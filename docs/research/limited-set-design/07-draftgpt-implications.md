# 07 — Implications for DraftGPT

[Research index](README.md) · [Source catalogue](sources.md)

This chapter compares the research with the repository inspected on 2026-10-14 at commit `f0c115c`, plus the existing working tree. Observations describe current code. Recommendations are proposals for step 6, not an approved architecture or implemented behavior.

## Current generation contracts

| Observed behavior | Evidence | Design consequence to investigate |
|---|---|---|
| The setting requests exactly eight archetypes, each with a name and description. | [Setting prompt](../../../convex/draft/prompts/setting.ts), [stored setting](../../../convex/draft/tables.ts) | No explicit pair coverage, pace, support counts, or overlap model. |
| Each pack request receives the setting, but no shared card inventory or reserved slot assignments. | [Gateway](../../../convex/draft/openai.ts) | Different packs can repeat the same functional jobs and omit others. |
| Each request asks for twelve designs, mostly commons/uncommons, with high power and a low curve. | [Pack prompt](../../../convex/draft/prompts/pack.ts) | Broad adjectives do not establish curves or playable archetypes. |
| The prompt asks for even dispersion across five colors, colorless, and multicolored. | [Pack prompt](../../../convex/draft/prompts/pack.ts) | This wording can suggest seven equal categories despite very different audiences. Actual output distribution needs measurement. |
| Only one or two cards per pack should implement the new mechanic; only one or two archetypes should touch it. | [Pack prompt](../../../convex/draft/prompts/pack.ts), [setting prompt](../../../convex/draft/prompts/setting.ts) | A fixed quota ignores whether the mechanic needs substantial support or works independently. |
| Packs are topped up to fifteen by sampling the setting's accumulated card pool. | [Round opening](../../../convex/draft/rounds.ts), [sampling](../../../convex/draft/passing.ts) | Copies have no role- or rarity-based weighting, and earlier pool entries can already include copies. |
| Parsing normalizes fields and checks minimal identifying content. | [Parsing](../../../convex/draft/parsing.ts) | Successful parsing does not establish rules correctness, balance, or sufficient synergy support. |
| Art receives a scene, world name/thesis, and a selected artistic tradition. | [Art prompt](../../../convex/draft/artPrompt.ts) | There is no structured reusable faction/world motif guide in this contract. |

These are structural risks, not claims that every current draft exhibits the corresponding failure. A corpus of actual generated drafts would be needed to measure prevalence.

## The strongest adaptation: plan the environment before filling packs

The skeleton and distribution research suggests separating **world intent**, **playable structure**, and **individual card invention**. The project can keep every world new while checking recurring functional needs. Novelty and a stable planning contract are compatible.

A proposed sequence:

1. **Interpret the group's premise.** Identify its strongest creative ingredients and the experience the world should produce.
2. **Choose the draft structure.** Specify primary colors/pairs, any secondary routes, and whether multicolor play needs unusual support.
3. **Write explicit deck briefs.** Define each strategy's resource, payoff, curve, win condition, counterplay, and shared support.
4. **Reserve functional slots across the draft.** Budget early creatures, interaction, fixing, enablers, rewards, bridges, and mana sinks.
5. **Generate cards for those jobs.** Give each request enough shared context to preserve definitions, names, and distribution commitments.
6. **Review and repair the collection.** Check missing support and conflicting definitions before packs are exposed.
7. **Apply creative concepts and art.** Keep the existing art direction while using a shared world vocabulary.
8. **Learn from actual drafts.** Record which promises the generated environment fulfilled.

This is a design proposal derived from [the skeleton research](03-skeleton-and-distribution.md), not evidence that Wizards uses this exact automated pipeline.

## Shared planning does not require one generation strategy

| Option | Advantage | Tradeoff |
|---|---|---|
| Generate the whole card pool before drafting | Can inspect all support and assemble packs from known cards. | More waiting and upfront generation; later rounds lose live invention. |
| Generate a complete slot plan, then cards by round | Bounds structural drift while retaining staged generation. | Needs durable reservations and a principled repair strategy. |
| Independently generate packs with richer prose | Smallest implementation change. | Still lacks enforceable global counts and cross-pack consistency. |

**Recommendation to investigate:** the second option matches the present staged workflow most closely. Compare it against the first before choosing an architecture. Do not use hidden player picks to manufacture favorable future packs without an explicit product decision; support promised by the environment should not become an invisible reward for a particular player's choices.

## Small tables change the support budget

The present constants request twelve designs per pack, three rounds, and fifteen final cards per pack. If every request returns all twelve accepted designs:

| Players | Nominal designed entries | Final card copies across the draft |
|---|---|---|
| 2 | 72 | 90 |
| 4 | 144 | 180 |
| 8 | 288 | 360 |

This is arithmetic from [the constants](../../../convex/draft/passing.ts), not a measured generation result. Designed entries are not guaranteed unique names. The implementation also accepts smaller responses down to six designs and fills the remaining slots, so real design diversity can be lower.

**Inference:** ten narrow archetypes compete for much less support space at two players than at eight. Blindly dividing 72 designs into ten isolated groups yields only about seven per group before accounting for color access, card roles, or competition. This is a warning illustration, not the actual allocation used by the app.

Possible responses are broader themes, more useful overlap, fewer heavily supported primary lanes while retaining general color playability, or a different pack/pool policy. None is automatically correct. Test them at the actual supported table sizes. An eight-player retail model is insufficient evidence for a two-player experience.

## A proposed design brief

These fields are an example of reviewable information, not a committed storage schema:

| Component | Information to preserve |
|---|---|
| World | Premise, tone, recurring vocabulary, motifs, exclusions. |
| Mechanic | Exact meaning, reminder wording, supported colors, dependencies, tracking needs. |
| Archetype | Colors, pace, early plays, resource, enablers, payoffs, win condition, weaknesses. |
| Connections | Which cards/resources neighboring decks compete for or reuse. |
| Slot | Color, rarity, curve position, functional job, primary and secondary uses. |
| Distribution | Table-wide counts, pack constraints, repetition policy, fixing supply. |
| Uncertainty | Assumptions requiring generation samples or human play. |

An **invented deck brief** might say: “BG salvagers defend with creatures that leave resources behind, fill the graveyard, and convert those resources into larger threats. Their removal buys time, but fast flyers pressure them. Some fodder overlaps with BR sacrifice; some recovery overlaps with GU value.” This is more testable than “BG Graveyard.” It still needs actual slots and cards before it becomes a supported deck.

## Evaluation before implementation claims

**Mechanical checks can establish** counts, explicit field consistency, missing mechanic definitions, impossible references, duplicate identities, unsupported representation, and compliance with chosen slot assignments. Such checks should be pure where possible, following the repository's functional-core rule.

**Model-assisted review can suggest** color-pie problems, unclear rules, implausible costs, conflicting flavor, and weak connections. These judgments should retain explanations and uncertainty. A model approving its own output is not a measured balance result.

**Distribution simulation can estimate** support availability, pack variance, and the effect of duplicate policy. A draft bot adds assumptions about pick behavior; document those assumptions rather than reporting its outcomes as human draft performance.

**Human play remains necessary** to judge decisions, pacing, fairness, bookkeeping, and whether the world feels like the players' invention. Use the [validation rubric](01-process-and-validation.md#what-validation-should-establish) and record enough context to distinguish a generation defect from a single unusual shuffle.

## Proposed acceptance questions for the eventual specification

1. Can each advertised primary deck be built from ordinary support without a required rare?
2. Do neighboring strategies share useful cards while retaining different priorities?
3. Can players understand the new mechanic consistently from the cards they receive?
4. Are the intended number of colors playable with the available fixing?
5. Do threats have plausible answers and slower strategies have time to function?
6. Can the current manual table represent every generated mechanic and card layout?
7. Does the world have recurring recognizable details without repetitive names and scenes?
8. Does the process still satisfy the desired waiting time and generation cost?
9. Do two-, four-, and eight-player drafts each retain meaningful choices?
10. Do generation retries preserve the shared plan and reject superseded work?

Numerical thresholds need experiments and a separate specification. This research does not justify inventing universal targets for removal, enablers, or archetype win rates.

## Boundaries and next decisions

Keep the [product vision](../../product-vision.md): original worlds, deliberate high power, trusted friends, and a manual table. Structural validation belongs in card creation; it does not authorize game-rule enforcement during play.

Before step 6 implementation, decide the pool/pack strategy, the policy for table size, the amount of custom-mechanic complexity, what players should know about the archetype map, and the acceptable latency/cost budget. Then write a feature specification with observable acceptance criteria. This directory supplies the research basis for those decisions.
