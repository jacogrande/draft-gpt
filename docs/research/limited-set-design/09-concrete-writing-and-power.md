# Concrete settings, subtext, and a stronger power floor

Research and implementation: 2026-10-15. This follows feedback on the Glasswake preview. The user wants physical settings, concrete comparisons with implied emotional meaning, and stronger cards. These are DraftGPT's house-style and gameplay requirements, not universal laws of literature or claims that one power band suits every Limited format.

## What the reading supports

Pound argues for precise images, economical language, and symbols that still work as ordinary objects when the reader does not interpret them symbolically. His warning about mixing abstraction with concrete description directly addresses our rejected premise. This is guidance from a particular poetic tradition, rather than a prohibition on all abstraction. [“A Retrospect” and “A Few Don'ts,” Poetry Foundation](https://www.poetryfoundation.org/articles/69409/a-retrospect-and-a-few-donts).

Hemingway's omission principle depends on the writer knowing the underlying situation. Leaving out the explanation can strengthen what the visible action suggests; leaving out the causal facts needed to understand the scene just creates a hole. The accessible Paris Review excerpt discusses his rewriting practice, but ends before the iceberg passage. Poynter quotes and discusses the principle from *Death in the Afternoon*, so it is a secondary source for that passage. [Paris Review interview, 1958](https://www.theparisreview.org/interviews/4825/the-art-of-fiction-no-21-ernest-hemingway), [Poynter, “What Lies Beneath”](https://www.poynter.org/reporting-editing/2005/what-lies-beneath-the-iceberg-theory-of-writing/).

Tolkien distinguishes naming something strange from making a believable secondary world around it. His discussion of fantasy and recovery also returns attention to ordinary materials and provisions. Our application is to make supernatural facts consistent with geography, labor, travel and daily consequences. That application is a design inference, not his checklist. [*On Fairy-Stories*, especially Fantasy and Recovery](https://www.istenalma.hu/sites/default/files/fairystories-tolkien.pdf).

For gameplay, Rosewater treats commons as the environment's dependable utility and expects competitive usefulness. “New World Order” budgets comprehension and board complexity; it does not equate simplicity with weak rates. These historical articles establish design principles, not contemporary numerical benchmarks. [“Common Courtesy,” 2002](https://magic.wizards.com/en/news/making-magic/common-courtesy-2002-06-10), [“New World Order,” 2011](https://magic.wizards.com/en/news/making-magic/new-world-order-2011-12-05).

For concrete efficiency anchors, Foundations' release notes describe Burst Lightning's one-mana damage with an optional late upgrade, Bake into a Pie's four-mana removal plus Food, and Think Twice's two-mana draw with a later graveyard use. These show that useful answers, flexible early plays and resource recovery can coexist. They are reference points, not instructions to copy cards or measured proof of our intended format's balance. [Foundations release notes, 2024](https://magic.wizards.com/en/news/feature/foundations-release-notes).

## House style

The Tolkien/Hemingway combination means material depth, a sense of accumulated history, plain verbs and restrained explanation. It does not mean copying passages, using faux-medieval grammar, or making every sentence three words long.

1. Establish a literal scene: where people stand, what they do, what they use, what obstructs them. Select a few consequential details rather than listing sensory nouns.
2. Let history alter the place: a repaired wall, a dry millrace, a cart road narrowed by houses. Let competing interests become actions over food, land, passage, tools, shelter or people.
3. If a comparison helps, give it two concrete subjects and a perceptible shared property. Keep its physical logic coherent. A description need not contain a metaphor.
4. Let behavior and juxtaposition carry the subtext. Leave the reader enough evidence to infer it; omit the explanatory moral.
5. Make magic observable. Identify the event, agent or device, limits and consequences. Literal fantasy is allowed. Abstract nouns acting as substances are not our default worldbuilding material.
6. Apply the policy to setting prose, names, flavor, motifs and art. Gameplay concepts in rules text and technical planning are exempt. This is a semantic rubric, not a blacklist that bans the word “memory” everywhere.

Original examples:

| Technique | Example | What it accomplishes |
|---|---|---|
| Literal setting | The inlet is sealed under clear glass. At low tide, the wrecks lie six feet below the carts crossing it. | An observable geography with practical consequences. |
| Concrete comparison | The snapped masts stood through the ice like spear shafts along a palisade. | Masts and shafts share shape and arrangement; the image may suggest conflict without naming an emotion. |
| Subtext through action | He set two bowls beside the fire. Before the others came in, he put one back. | A change in a routine implies an absence; the prose leaves its cause unstated. |
| Observable magic | Held over a flame, the ship's lamp projects the last room lit by its wick. Its glass cracks after three uses. | A fantastical device has a visible operation and limit. |

The rejected line, “A frozen ocean of glass preserves the memories of every ship it swallowed,” neither establishes what can actually be recovered nor grounds the emotional claim in an event. It came partly from our own preview seed. Changing the output prompt while retaining that seed uncritically would preserve the failure.

A concrete alternative, written as a style example rather than generated output:

> Glass covers the inlet from the salt marsh to the ruined lighthouse. The wrecks can be seen beneath it on clear mornings. Salvagers lower boys through narrow shafts to tie ropes around the cargo. At the bridge, soldiers weigh every sack of grain before allowing a cart through. The village across the water has stopped sending its children to market.

## Why the first cards were weak

The actual candidate and reviewers exposed several independent failures:

| Design | Observed problem | Required response |
|---|---|---|
| C016 Ferrywall Shield | Five mana to cast, two to equip, only +0/+3 | Count total investment; give an expensive artifact immediate value and a real combat benefit, or plan it in a cheaper slot. |
| C039 Glassbeach Daredevil | Five-mana 4/3 with only a small conditional temporary bonus | An expensive creature needs meaningful impact or reward. |
| C031 Ferry-Shed Supper Board | Four mana and a card for occasional one-life triggers | Supply board impact, immediate value or a substantial engine. |
| C062 Reflected Bearings | Two mana to scry; card replacement itself requires an artifact | Give a reliable baseline; use synergy to improve it. |
| U040 Orren | Five-mana uncommon 4/4 with only conditional +1/+1 | An uncommon payoff needs a reason to commit a slot and turn to it. |
| C014 and C019 reviewer verdicts | A one-shot trigger was treated as repeatable removal; a very costly damage engine was condemned without a demonstrated loop | Require the enabling cards, timing, full costs and counterplay before a nerf. |

The previous reference bands stressed modest upsides and discouraged efficient common answers. The fixed skeleton then assigned expensive bands to generic small-effect roles. The editorial loop could preserve weak cards or reduce them further. This was a system problem, not merely a disappointing random batch.

## Implementation and evaluation

- `set/creative.ts` supplies the shared writing policy to planning, writing, screening and review.
- `set/references.ts` defines the strong custom-cube target, useful rate ranges, actual preview failure cases, and the evidence needed for a nerf. These remain editorial starting points, not human-calibrated win-rate targets.
- Stage prompts now require useful baselines, meaningful synergy rewards, justified restrictions, concrete creative rewrites and explicit attention to underpowered cards.
- `set/curve.ts` plans costs with the type and role. At 135 cards, 40 of 70 commons are creatures; each color has five common creature slots capped at three mana, cheap interaction, and larger threats. The 270-card profile repeats that common coverage. Signposts and fixing remain reserved.
- New runs record prompt version 4, rubric version 2 and profile version 2. Existing frozen designs and the original preview are preserved.
- `scripts/evaluate-set-prompts.ts` runs a bounded live probe against eleven known weak designs and four controls, regenerating their slots under a new brief while holding the original type/mana contracts fixed. It saves raw task/results and a comparison. This is an in-sample development check, not a held-out evaluation or a complete draft.

Success means stronger visible card choices and more concrete prose, not just compliance with schema or more favorable self-review. Human evaluation, full-set exposure analysis and games remain necessary. A reviewer agreeing with a generator is not independent proof of quality.

Source-access note: the Pound and Poynter passages were available in search excerpts; opening their complete pages returned HTTP 403. Tolkien's essay and the Wizards articles were read directly. The Paris Review page exposed only its opening interview section.

### Live development evidence

Two small probes used the original abstract seed as a stress case. The resulting briefs described settlements, routes, cargo, tools and visible magical events rather than treating memory as a material. The first review flagged eleven of eleven deliberately selected weak cases and no control cases; the second flagged ten of eleven and no controls. These known examples overlap the guidance and cannot establish held-out accuracy.

The second probe ran one coordinated editing pass. An earlier five-mana 4/4 with a conditional +1/+1 became a 5/5 trampler that adds a counter to another creature. A three-mana enchantment that only conditionally scried gained an immediate card draw and an uncapped artifact-entry scry trigger. Those are concrete improvements to body, impact and resource return.

Its final reviewer nevertheless reported no issues while two cards still undershot the target: a five-mana artifact making a 2/2 with a toughness-only team bonus, and a two-mana draw-one/discard-one/scry-two sorcery. The reference bands now address both costs explicitly. The current profile also puts common artifacts in cheaper bands. This discrepancy is recorded rather than treating the model's approval as proof of success.

Text usage was approximately $0.0116 for the first probe and $0.0151 for the second, before a focused recheck. Art was not regenerated. The artifacts in `.artifacts/prompt-pilot-v4/` and `.artifacts/prompt-pilot-v4-revised/` preserve the cards, decisions and critiques. A new full-set candidate and human feedback remain the next format-quality evidence.

A final focused recheck with the corrected guidance flagged both missed rates and left the two stronger controls alone; it also caught a missing assigned flashback ability. Its reported text cost was $0.00109. This supports the specific rubric correction, not a claim that all future reviewers will be reliable.
