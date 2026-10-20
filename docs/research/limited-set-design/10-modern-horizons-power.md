# Modern Horizons power calibration

Research date: 2026-10-16. The user selected a **Modern Horizons strength level** after rejecting the stronger-but-still-bland Clear Sea sample. This replaces the vague “above ordinary Limited” design intent. It does not assert that the current generator already meets the new target.

The reference library contains **72 examples in 24 cells**: common, uncommon, rare, and mythic × Creature, Instant, Sorcery, Enchantment, Artifact, and Land × too strong, target, and too weak. An additional **15 role and combo references** bring the total to **84 distinct card designs**; Mana Drain, Channel, and Tolarian Academy deliberately appear at two real printed rarities.

## Read the references

- [Commons](power-references/common.md): real early efficiency, useful synergy resources, and limits on common engines.
- [Uncommons](power-references/uncommon.md): strong two-for-ones, meaningful engines, and scalable interaction.
- [Rares](power-references/rare.md): cheap threats that matter, efficient flexibility, and substantial build-arounds.
- [Mythics](power-references/mythic.md): consequential finishers and engines with actual deployment costs.
- [Additional role anchors and combo analysis](power-references/roles-and-combos.md): closer comparisons for Equipment, fixing, draw/discard, and recursion.
- [Structured reference library](power-references/cards.json): exact printings, source URLs, mana and type facts, role, band, effect summary, reasoning, and context. This is research data, not a `CardFace` payload.

Every example has a direct card source. The tables below are an index; the linked files contain the reasoning and limitations.

## The target

Design for a high-powered, interactive **two-player draft**, using Modern Horizons' efficient commons, layered synergy, and substantial rewards as the reference. A plausible maindeck card should do something worth its mana and card investment before its best-case combination. Payoffs can be genuinely exciting. Strong interaction is part of the environment, not something to apologize for.

Wizards describes MH3 as serving Modern alongside other audiences, with a distinct final Limited-balancing responsibility. That supports treating constructed and draft evaluation separately. It does not supply a numerical power band for our custom set. [MH3 design account](https://magic.wizards.com/en/news/making-magic/third-times-the-charm-part-2).

Fourteen of the 24 primary target examples use MH1, MH2, or MH3 printings. Other sets supply useful functional comparisons and historical boundaries. This library intentionally includes cards not legal in Modern: the user asked for power boundaries, not a Modern legality list.

Our target includes:

- **Common:** Galvanic Discharge, Malevolent Rumble, Eldrazi Repurposer, and supported Refurbished Familiar. Expect efficient interaction, several useful resources on a card, or a substantial synergy reward.
- **Uncommon:** Flametongue Yearling, Lingering Souls, Counterspell, Barbed Spike, and Abiding Grace. A body plus removal, repeatable recovery, or two useful casts is appropriate.
- **Rare:** Psychic Frog, Damn, Bitterblossom, Nettlecyst, and Force of Negation. Let cards threaten a real advantage, offer efficient modes, or trade card economy for exceptional tempo.
- **Mythic:** Archon of Cruelty, Magma Opus, Wurmcoil Engine, and The Meathook Massacre. Expensive cards can recover the board and generate material immediately. Costly dramatic effects are not automatically excessive.

These are role-specific examples, not a proposed set list. Combining every target without reviewing their interactions would be a mistake: Persist plus a cheap way to bin Archon of Cruelty changes Archon's effective deployment cost drastically.

## What the three bands mean

**Too strong** means above our intended ceiling under the stated conditions. Some are direct efficiency extremes, such as Ancestral Recall or Mana Crypt. Others are conditional warnings, such as artifact lands with affinity or Nadu with repeatable targeting. The condition is part of the verdict; never discard it when using these as prompt examples.

**Target** means an attractive functional reference for this ambitious environment, not proof that the card is fair in every format or deck. Some target cards are build-arounds. Cavern of Souls needs meaningful creature-type overlap; Echo of Eons needs graveyard access and benefits both players. A reference does not require importing its keyword, card name, or exact effect.

**Too weak** means insufficient return for the intended role and support. The library distinguishes obvious failures, near-floor cards such as Divination and Air Elemental, and unsupported packages such as Maze's End without ten Gates. A card can be playable elsewhere and still be below this project's target.

**These classifications are our editorial judgments.** Scryfall supplies the facts, not these labels. The library still needs the user's calibration and actual games. No single aggregate score or claimed win-rate threshold hides that distinction.

## Complete matrix

| Rarity | Type | Too strong in stated context | Target | Too weak in stated context |
|---|---|---|---|---|
| Common | Creature | [Writhing Chrysalis](https://scryfall.com/card/mh3/208/writhing-chrysalis) | [Eldrazi Repurposer](https://scryfall.com/card/mh3/150/eldrazi-repurposer) | [Hill Giant](https://scryfall.com/card/9ed/197/hill-giant) |
| Common | Instant | [Sprout Swarm](https://scryfall.com/card/fut/138/sprout-swarm) | [Galvanic Discharge](https://scryfall.com/card/mh3/122/galvanic-discharge) | [Healing Salve](https://scryfall.com/card/7ed/18/healing-salve) |
| Common | Sorcery | [Treasure Cruise](https://scryfall.com/card/ktk/59/treasure-cruise) | [Malevolent Rumble](https://scryfall.com/card/mh3/161/malevolent-rumble) | [Divination](https://scryfall.com/card/m10/49/divination) |
| Common | Enchantment | [Pestilence](https://scryfall.com/card/usg/147/pestilence) | [Witness Protection](https://scryfall.com/card/snc/66/witness-protection) | [Asha's Favor](https://scryfall.com/card/con/2/ashas-favor) |
| Common | Artifact | [Cranial Plating](https://scryfall.com/card/5dn/113/cranial-plating) | [Lembas](https://scryfall.com/card/ltr/243/lembas) | [Golden Urn](https://scryfall.com/card/som/158/golden-urn) |
| Common | Land | [Seat of the Synod](https://scryfall.com/card/mrd/283/seat-of-the-synod) | [Silverbluff Bridge](https://scryfall.com/card/mh2/255/silverbluff-bridge) | [Shimmering Grotto](https://scryfall.com/card/lrw/273/shimmering-grotto) |
| Uncommon | Creature | [Amped Raptor](https://scryfall.com/card/mh3/114/amped-raptor) | [Flametongue Yearling](https://scryfall.com/card/mh2/125/flametongue-yearling) | [Air Elemental](https://scryfall.com/card/m10/42/air-elemental) |
| Uncommon | Instant | [Mana Drain](https://scryfall.com/card/leg/65/mana-drain) | [Counterspell](https://scryfall.com/card/mh2/267/counterspell) | [Frazzle](https://scryfall.com/card/gpt/25/frazzle) |
| Uncommon | Sorcery | [Channel](https://scryfall.com/card/4ed/236/channel) | [Lingering Souls](https://scryfall.com/card/dka/12/lingering-souls) | [Ransack](https://scryfall.com/card/sth/39/ransack) |
| Uncommon | Enchantment | [Land Tax](https://scryfall.com/card/leg/26/land-tax) | [Goblin Bombardment](https://scryfall.com/card/tmp/179/goblin-bombardment) | [Honden of Cleansing Fire](https://scryfall.com/card/chk/14/honden-of-cleansing-fire) |
| Uncommon | Artifact | [Skullclamp](https://scryfall.com/card/dst/140/skullclamp) | [Barbed Spike](https://scryfall.com/card/mh2/5/barbed-spike) | [Angel's Feather](https://scryfall.com/card/dst/92/angels-feather) |
| Uncommon | Land | [Strip Mine](https://scryfall.com/card/4ed/363/strip-mine) | [Ghost Quarter](https://scryfall.com/card/dis/173/ghost-quarter) | [Terminal Moraine](https://scryfall.com/card/pls/142/terminal-moraine) |
| Rare | Creature | [Nadu, Winged Wisdom](https://scryfall.com/card/mh3/193/nadu-winged-wisdom) | [Psychic Frog](https://scryfall.com/card/mh3/199/psychic-frog) | [Wood Elemental](https://scryfall.com/card/leg/215/wood-elemental) |
| Rare | Instant | [Ancestral Recall](https://scryfall.com/card/lea/47/ancestral-recall) | [Force of Negation](https://scryfall.com/card/mh1/52/force-of-negation) | [Pale Moon](https://scryfall.com/card/nem/36/pale-moon) |
| Rare | Sorcery | [Balance](https://scryfall.com/card/lea/3/balance) | [Damn](https://scryfall.com/card/mh2/80/damn) | [Morality Shift](https://scryfall.com/card/jud/70/morality-shift) |
| Rare | Enchantment | [Opposition](https://scryfall.com/card/uds/40/opposition) | [Bitterblossom](https://scryfall.com/card/mor/58/bitterblossom) | [Conjured Currency](https://scryfall.com/card/rtr/33/conjured-currency) |
| Rare | Artifact | [Umezawa's Jitte](https://scryfall.com/card/bok/163/umezawas-jitte) | [Nettlecyst](https://scryfall.com/card/mh2/231/nettlecyst) | [Jayemdae Tome](https://scryfall.com/card/7ed/305/jayemdae-tome) |
| Rare | Land | [Tolarian Academy](https://scryfall.com/card/usg/330/tolarian-academy) | [Prismatic Vista](https://scryfall.com/card/mh1/244/prismatic-vista) | [Wintermoon Mesa](https://scryfall.com/card/pcy/143/wintermoon-mesa) |
| Mythic | Creature | [Uro, Titan of Nature's Wrath](https://scryfall.com/card/thb/229/uro-titan-of-natures-wrath) | [Archon of Cruelty](https://scryfall.com/card/mh2/75/archon-of-cruelty) | [Sphinx Sovereign](https://scryfall.com/card/ala/196/sphinx-sovereign) |
| Mythic | Instant | [Mana Drain](https://scryfall.com/card/ima/65/mana-drain) | [Magma Opus](https://scryfall.com/card/stx/203/magma-opus) | [Stunning Reversal](https://scryfall.com/card/bbd/51/stunning-reversal) |
| Mythic | Sorcery | [Channel](https://scryfall.com/card/ima/157/channel) | [Echo of Eons](https://scryfall.com/card/mh1/46/echo-of-eons) | [Archangel's Light](https://scryfall.com/card/dka/1/archangels-light) |
| Mythic | Enchantment | [Necropotence](https://scryfall.com/card/ima/98/necropotence) | [The Meathook Massacre](https://scryfall.com/card/mid/112/the-meathook-massacre) | [Cast Through Time](https://scryfall.com/card/roe/55/cast-through-time) |
| Mythic | Artifact | [Mana Crypt](https://scryfall.com/card/ema/225/mana-crypt) | [Wurmcoil Engine](https://scryfall.com/card/som/223/wurmcoil-engine) | [Alhammarret's Archive](https://scryfall.com/card/ori/221/alhammarrets-archive) |
| Mythic | Land | [Tolarian Academy](https://scryfall.com/card/vma/319/tolarian-academy) | [Cavern of Souls](https://scryfall.com/card/lci/269/cavern-of-souls) | [Maze's End](https://scryfall.com/card/dgm/152/mazes-end) |

## Avoid repeating the last review's mistakes

1. **Match role after rarity and type.** Sprout Swarm and Galvanic Discharge are both instants, but one is an engine and the other removal. The matrix covers the requested categories; it does not imply a universal ordering of their effects. Retrieve a closer role anchor before judging a candidate.
2. **Compare effective cost.** Include colored commitments, the first equip or activation, pitching a second card, sacrificed resources, required creatures, and when value arrives. “Four mana” does not describe Refurbished Familiar in an artifact deck. “Zero mana” does not describe Force of Negation's full card cost.
3. **Credit useful baseline output.** Barbed Spike supplies a 2/1 flyer for two mana before any future equip payment. Lembas replaces itself on entry. Lingering Souls has a playable first cast. These are materially different from an expensive permanent that only promises small later rewards.
4. **Do not invent safety taxes.** Counterspell can be unconditional at two blue mana. Goblin Bombardment can have no mana activation cost because each activation consumes a creature. Reject an actual problematic package, not the presence of a strong ability.
5. **Do not ignore support.** Land Tax does not ramp onto the battlefield. A Clue costs two more mana to draw. Faithless Looting loses a net card on its first cast yet can be excellent because of its price and graveyard function. A printed high cost may be bypassed; an attractive payoff may be unsupported.
6. **Check packages explicitly.** Basking Broodscale plus Sadistic Glee and an initial Spawn creates an unlimited counter/Spawn-sacrifice loop. Repeated colorless mana still needs a sink to win immediately. That concrete chain is stronger evidence than a vague warning that “recursion might exist.”
7. **Rarity changes frequency, not text.** The same Mana Drain, Channel, and Tolarian Academy remain dangerous at different rarities. Conversely, do not assign a common a mythic's average impact just because an alternate printing has a different symbol.
8. **Preserve fixed slots in repair.** If the slot cannot change its cost, color, type, or rarity, adjust the effect at that slot. A reference at a different cost is context, not authorization to violate the contract.

A reviewer should identify: candidate slot; closest same-role target; cost difference; immediate output; actual support; expected output after ordinary setup; counterplay; and the exact defect. The correction must identify the card and preserve its fixed constraints. A “too strong” finding needs a specific excess or interaction; a “too weak” finding needs a concrete deficit.

## Evidence and collection method

**Card facts:** fetched from Scryfall's public JSON API, using exact name/set requests followed by collection requests. Every final selection was checked for the requested rarity and a type line containing its assigned card type. Printing UUID, Oracle UUID, collector number, set, release date, and direct API/card URLs are retained. The prose summaries paraphrase the effects; consult the linked current Oracle text for complete rules.

**Rarity edge cases:** Tolarian Academy is rare in Urza's Saga and mythic in the digital draft set Vintage Masters. Cavern of Souls is mythic in The Lost Caverns of Ixalan. Goblin Bombardment uses its Tempest uncommon printing. Mythic rarity did not exist in the oldest sets, so those cards are not retroactively called mythic. Wurmcoil Engine qualifies as both artifact and creature; this grid uses it in the artifact cell. Equipment and Aura are represented within Artifact and Enchantment. Planeswalkers and other card types are outside the generator's current supported six-type scope.

**External power context:** Paul Cheon's firsthand MH3 draft assessment specifically calls out Writhing Chrysalis as an exceptional common. This corroborates its outlier status, not a transferable numerical score. [June 2024 draft commentary](https://www.youtube.com/watch?v=214jwV92jcY).

Wizards' Nadu postmortem documents repeatable targeting and the more elaborate constructed loops that defeated the intended limits. Our conditional warning uses that mechanism, not an assumption that the same combo appears in a generated set. [Nadu postmortem, August 2024](https://magic.wizards.com/en/news/feature/on-banning-nadu-winged-wisdom-in-modern).

The December 2024 announcement describes Amped Raptor's acceleration in Boros Energy and records Psychic Frog's Legacy ban. Those are format-specific observations. We deliberately keep Psychic Frog as an ambitious Limited target rather than equating all constructed bans with excessive draft power. [December 2024 announcement](https://magic.wizards.com/en/news/announcements/banned-and-restricted-december-16-2024).

**No usable win-rate dataset was obtained.** A dated MH3 Premier Draft request to 17Lands returned negligible sample counts and null win rates. It was excluded. No popular secondary article's early percentages were copied as current or causal evidence.

**Reproducibility:** `cards.json` pins every reference to its API UUID. Run `python docs/research/limited-set-design/power-references/fetch-card-facts.py` to fetch those facts again into `.artifacts/mh-power-reference/refreshed-card-facts.json`. It uses batches, stops or backs off on rate limiting, and validates rarity/type before writing. Original development snapshots remain under `.artifacts/mh-power-reference/`; these ignored artifacts are supplementary, while the curated facts and source identifiers are stored in the research directory. Scryfall's documentation pages returned HTTP 403 to the browser tool, but its JSON card endpoints were accessible. A fresh fetch may contain updated Oracle wording; it must not silently relabel the editorial bands.

## Integration status

The structured library feeds a generated runtime catalog and role-based retrieval shared by writers, screeners and reviewers. See [Luna prompting and evidence tools](11-luna-prompting.md) for implementation, evaluation commands and results. Production deployment and human balance acceptance remain separate gates.

The implementation selects bounded same-type, role-ranked examples, exposes cost/color mismatches, and records the selected reference IDs in evaluation artifacts. Test for both missed weak designs and unjustified nerfs. Keep a separate held-out evaluation set: these examples are teaching material, so success on them is not independent validation.
