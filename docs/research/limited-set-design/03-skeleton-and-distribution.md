# 03 — Skeleton, distribution, and balance

[Research index](README.md) · Next: [Mechanics and novelty](04-mechanics-and-novelty.md)

## The skeleton reserves functional space

A design skeleton is a provisional inventory of card slots. It maps the needs of a set before every card has been invented. Color, rarity, card role, creature size, and mana value give each slot a job. The original explanation uses a hypothetical small set; its counts are examples, not a modern universal template. [Design Skeleton](https://magic.wizards.com/en/news/making-magic/nuts-bolts-design-skeleton-2010-02-15).

Rosewater recommends beginning with commons and difficult constraints, including new mechanics and cycles. Individual designs can force revisions elsewhere, so the skeleton must remain editable. The purpose is to expose competing demands before they become expensive to resolve. [Filling In the Design Skeleton](https://magic.wizards.com/en/news/making-magic/nuts-bolts-filling-design-skeleton-2011-02-28).

An **illustrative slot specification**, not a Wizards format:

```text
ID: CW03
Color and rarity: white common
Role: early creature that can attack
Mana value: 2
Primary deck: small-creature teamwork
Secondary use: expendable body for sacrifice
Constraint: remains useful without a payoff
Creative assignment: ordinary worker from the shared world
```

A slot is more useful than “make a cool white card” because it describes what would be missing if that card were absent.

## Color counts do not imply identical structure

The 2021 default skeleton had 101 commons and 80 uncommons. It described different creature proportions by color—white highest, blue lowest—and deliberately distributed creature mana values. For skeleton purposes, a spell that creates attacking tokens can occupy a creature slot, while a creature unable to attack may not. These are functional categories, not just printed card types. [Design Skeleton Revisited](https://magic.wizards.com/en/news/making-magic/nuts-bolts-13-design-skeleton-revisited-2021-03-22).

The 2024 Play Booster article revises that starting structure around fewer commons, more uncommons, and variable rarity composition. It explicitly treats the template as a starting point that changes for the set. Its Murders at Karlov Manor rare-frequency example is product-specific, not a probability to copy into every generated booster. [Play Boosters](https://magic.wizards.com/en/news/making-magic/nuts-and-bolts-16-play-boosters).

The accompanying Wizards Q&A describes broader utility at common, more niche and build-around effects at uncommon, and increased availability of answers appropriate to the environment's threats. A narrow sideboard effect can become one mode on a card with another use. [Play Booster Q&A](https://magic.wizards.com/en/news/announcements/play-booster-discord-q-and-a).

**Synthesis:** rarity influences encounter frequency, teaching, complexity, and deck incentives. It is not merely a power score. A generated “Common” label has no distribution effect unless the generator or pack assembler gives it one.

## Support beyond theme cards

Wizards' structural-support account checks creature proportions, mana curves within both colors and archetypes, fixing, mana sinks, smoothing, evasion, and interaction. Too much fixing can erase distinctions by allowing the best cards into every deck; too little prevents intended multicolor play. Mana sinks make later lands useful, and evasion helps games end. [Structural Support](https://magic.wizards.com/en/news/making-magic/nuts-and-bolts-15-structural-support).

**Synthesis: review each intended deck as a complete machine.**

| Need | Diagnostic question |
|---|---|
| Early plays | Can it affect the game before its main engine starts? |
| Curve | Are there enough usable cards at the stages where this plan needs them? |
| Interaction | Can it respond to the actual threats present in this set? |
| Finishing | How does it win through a stalled battlefield? |
| Resource access | Can it produce the colors, tokens, graveyard cards, or other inputs it needs? |
| Flood mitigation | What productive action remains after drawing several lands? |
| Recovery | Does one removal spell invalidate the entire strategy? |
| Alternative builds | Can it still work when another drafter contests some support? |

These questions apply to aggressive decks as much as slower ones. An efficient curve is not necessarily a single low average mana value: a deck may need its scarce two-mana cards to be creatures, not more conditional tricks.

## As-fan: measure what appears in packs

As-fan is the expected number of cards with some property in a booster. Wizards' math account connects it to rarity sheets, variable slots, and dedicated theme slots. A dedicated slot can guarantee an appearance; an equal average across random slots cannot. [Do the Math](https://magic.wizards.com/en/news/making-magic/do-the-math).

For a hypothetical pack with uniform selection within rarity pools:

```text
expected theme cards = sum over rarities r of E[slots at r] × theme_cards_r / pool_size_r
```

This is a simplified model. Actual collation can use different sheets, treatments, exclusions, or slots; use their actual probabilities. The expectation does not require independent slots, but probability-of-absence calculations do need a model of dependence.

**Invented arithmetic example:** ten common slots, three uncommon slots, and one rare slot; 12 theme cards among 80 commons, 8 among 100 uncommons, and 4 among 60 rares:

```text
10 × 12/80 + 3 × 8/100 + 1 × 4/60 ≈ 1.81 theme cards per pack
```

This is not a current Wizards booster recipe. It demonstrates why putting a theme only at rare makes it much less visible than giving it common support.

## Averages are insufficient

The following are **mathematical deductions and proposed diagnostics**, not published Wizards targets.

If each of 15 independent slots has a 10% chance of supporting a mechanic, the mean is 1.5 cards per pack. Yet the chance of none is `0.9^15 ≈ 20.6%`. Raising the average, guaranteeing a slot, and redistributing support can produce different player experiences.

Separate these measurements:

| Measurement | What it answers |
|---|---|
| Set-file share | How many distinct designs have the property? |
| Pack as-fan | How often is it opened? |
| Table supply | How many relevant copies exist in this draft? |
| Drafter access | Which copies can a player reasonably acquire? |
| Deck density | How many relevant cards make the final deck? |
| In-game access | How often does the deck draw the pieces in time? |

Seeing a card repeatedly as a pack wheels does not create extra supply. Nor does a table containing twelve enablers imply one drafter can take twelve: other decks may want them too.

For another **invented calculation**, a 40-card deck containing eight enablers has a probability `1 − C(32,9)/C(40,9) ≈ 89.7%` of finding at least one among its first nine cards. This ignores mulligans, extra draws, casting constraints, and whether the payoff also appears. It is a consistency check, not a win-rate prediction.

Here `C(n,k)` counts ways to choose `k` objects from `n` without regard to order; the fraction is the chance that all nine cards come from the 32 non-enablers.

## Balance at the environment level

An environmental review should inspect the relationship between threat sizes and removal, combat tricks and blocking, repeatable advantage and answers, and colored commitments and fixing. Equal numbers of cards do not establish equal strength. This is a synthesis of the structural sources and the [New Capenna failure discussed in chapter 1](01-process-and-validation.md#intent-results-and-uncertainty).

For DraftGPT, a useful distinction is **power ambition versus structural reliability**. Keeping the product's high-power goal does not require every card to be an engine or every rare to overwhelm the available answers. First establish what a normal game should allow each player to do, then evaluate exceptional cards against that baseline.
