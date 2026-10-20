# 04 — Mechanics and novelty

[Research index](README.md) · Next: [Worlds and aesthetics](05-worlds-and-aesthetics.md)

## Newness can appear at several levels

A set can introduce a named ability, reuse an existing one in a new context, emphasize an unnamed behavior, reorganize color relationships, or use a different card presentation. These choices have different costs. A new keyword is only one possible source of novelty.

Wizards' structural-support article distinguishes named mechanics, unnamed mechanics, and themes that care about a category of cards. Its 2023 observation that many premier sets use three to six named mechanics describes an existing product scale; it is not a recommended quota for a much smaller generated environment. [Structural Support](https://magic.wizards.com/en/news/making-magic/nuts-and-bolts-15-structural-support).

**Synthesis:** select mechanics because they create the desired decisions or make the world tangible. Naming an incidental behavior does not automatically make it deeper. Conversely, an unnamed theme can define many picks and games.

## Ask what a mechanic needs

Wizards distinguishes modular mechanics that work with ordinary cards from linear mechanics that encourage particular companions. A/B mechanics require both enablers and rewards. Its Theros example also distinguishes escape: individual escape cards work alone, but several compete for the same graveyard resource. Support must address that competition. [Limited mechanics](https://magic.wizards.com/en/news/making-magic/nuts-bolts-12-part-1-limited-mechanics-2020-03-09).

“Parasitic” is a separate question: does the mechanic depend on things confined to its own set or block? It is not simply another word for synergistic. A linear theme can use widely available resources. [R&D terminology](https://magic.wizards.com/en/news/making-magic/few-more-words-rd-2016-11-07).

**Proposed mechanic worksheet:**

| Dimension | Question |
|---|---|
| Player action | What does the player do differently because this exists? |
| Inputs | Which cards or game events enable it? |
| Rewards | What useful output makes the setup worthwhile? |
| Frequency | How often should it matter in an ordinary game? |
| Compatibility | Can familiar cards contribute? Can neighboring decks use it? |
| Competition | Do its own cards consume a shared scarce resource? |
| Design space | Can several clear commons use it in meaningfully different ways? |
| Counterplay | What can an opponent do before or after it activates? |
| Logistics | What must players remember, mark, reveal, or create? |

This worksheet is an adaptation for research and generation, not a claim about Wizards' internal schema.

## Complexity is an environment-wide budget

New World Order distinguishes comprehension complexity, board complexity, and strategic complexity. Its central change was deliberate management of complexity at common while permitting more at higher rarities. The argument is not that commons must do nothing; complexity at common needs a purpose, especially when teaching the set's theme. [New World Order](https://magic.wizards.com/en/news/making-magic/new-world-order-2011-12-05).

Lenticular design describes cards whose obvious use is understandable while experienced players discover additional strategic applications. It seeks depth without forcing every player to process all implications immediately. [Lenticular Design](https://magic.wizards.com/en/news/making-magic/lenticular-design-2014-12-15).

**Synthesis:** count the decisions and reminders visible across a battlefield, not just words per card. Five short persistent triggers may be harder to track than one longer spell resolved once. A generated set also lacks players' prior familiarity, making consistent wording and repeated patterns especially valuable.

Historical complexity policies should be read alongside the [Play Booster changes](03-skeleton-and-distribution.md#color-counts-do-not-imply-identical-structure). The useful principle is intentional allocation, not an assumed permanent prohibition on interesting commons.

## Evaluate and revise the mechanic itself

The Storm Scale articles assess returning mechanics along axes including popularity, design space, versatility, development difficulty, and playability. These are separate dimensions: an appealing concept may be hard to balance, and a large design space may still require too much infrastructure. The scale predicts return likelihood in a particular context; it is not a general numerical quality rating. [Storm Scale introduction](https://magic.wizards.com/en/news/making-magic/storm-scale-khans-tarkir-block-2016-02-29).

For example, the Zendikar analysis highlights the dependency between ingest and processors and the bookkeeping around exile. Its ratings are historical, but its explanation shows why an interconnected mechanic package can be costly to insert into a set. [Zendikar Storm Scale](https://magic.wizards.com/en/news/making-magic/storm-scale-zendikar-and-battle-zendikar-2016-11-21).

**Proposed rejection criteria for a generated mechanic:**

- It cannot be explained consistently across its own cards.
- It requires more supporting slots than the environment can provide.
- Its satisfying version needs a specific rare to function.
- Every implementation either does nothing or produces a runaway loop.
- It mostly adds bookkeeping without changing useful decisions.
- Its flavor promises something the gameplay never delivers.

The remedy might be simpler wording, a lower threshold, more ordinary enablers, an activation cost, narrower distribution, or replacement. More payoff cards are not the universal solution.

## Types of innovation need different infrastructure

| Innovation | What to verify before adopting it in DraftGPT |
|---|---|
| A new keyword on familiar card types | Stable definition, reminder text, and enough suitable designs. |
| A resource such as a new token | Precise token definition, production rate, consumers, and tabletop handling. |
| A theme such as graveyard diversity | Required card types actually appear and can reach the zone. |
| A new layout or double-faced card | Storage, rendering, preview, and manual state representation can express it. |
| A rules object or extra zone | Players can represent and understand its state without app enforcement. |
| A new faction structure | Fixing, color commitments, and transition paths support it. |

This table is a DraftGPT feasibility screen. It does not suggest that the app should become a rules engine. A mechanic can be valid in tabletop Magic yet unsuitable for the current client representation.

## Give mechanics distinct jobs

**Synthesis:** a compact package can include a signature experience, a familiar supporting behavior, and a way to smooth draws or spend excess mana. These jobs can overlap. One mechanic may do several; several mechanics may serve one broad theme. Avoid requiring a fixed count before examining the environment.

An **invented example** is a world of scavengers after a magical flood. Familiar discard and graveyard-recovery effects can express salvage. A new ability might provide a choice between recovering an object and converting it into another resource. The research question is whether that choice improves games and fits the support budget—not whether “salvage” sounds like a plausible keyword.
