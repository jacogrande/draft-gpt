# Busted power reference pool

Date: 2026-10-20. Implemented locally; real-model calibration and playtesting pending. No deployment.

The user requested a second power level drawing on the strongest cards in Magic's history: Power Nine, Vintage Cube cards and Modern staples. There is no authoritative strongest-1,000 ranking across formats. This implementation uses a reproducible **1,000-card high-power reference pool**, selected by evidence of use and historical inclusion. Selection score is provenance priority, not a measured power rating. Some entries are support pieces whose power depends on their environment.

## Sources and selection

The source snapshot is [`convex/draft/set/catalog/busted.json`](../../../convex/draft/set/catalog/busted.json). Each card records its Oracle ID, printing ID, rarity, set/collector number, layout, mana cost, full rules, color identity, stats, Scryfall link and source IDs. Source pages have hashes in the snapshot. Retrieved October 20, 2026.

The pool was selected from 1,058 distinct nonbasic Oracle identities:

- All nine Power Nine cards are pinned to their Alpha printings, verified through Scryfall's collection endpoint.
- The [current MTGO Vintage Cube](https://www.mtgo.com/vintage-cube-cardlist), listed as effective October 7, contributes all 540 current cards.
- Historical official MTGO lists: [winter 2023](https://www.mtgo.com/news/mtgo-vintage-cube-12142023), [spring 2024](https://www.mtgo.com/news/spring-2024-vintage-cube-update), [May 2024](https://www.mtgo.com/news/vintage-cube-update-may-2024), and [winter 2024](https://www.mtgo.com/news/winter-24-vintage-cube-update). The importer reads each full 540-card table, removes struck-through superseded names, and rejects unexpected counts.
- MTGGoldfish's 50-entry overall, creature, spell and land lists for [Modern](https://www.mtggoldfish.com/format-staples/modern/full/all), [Legacy](https://www.mtggoldfish.com/format-staples/legacy/full/all), and [Vintage](https://www.mtggoldfish.com/format-staples/vintage/full/all). These show current use, not timeless standalone strength; source IDs preserve which lists contain each card.
- Scryfall's `(restricted:vintage or banned:modern) game:paper` supplies historical outliers. Ban/restriction status is evidence for inclusion, never an automatic draft verdict. The [official banned/restricted page](https://magic.wizards.com/en/banned-restricted-list) describes format-specific restrictions.

Inclusion priority is additive: 10,000 for Power Nine; 1,000 for the current cube; 500 per distinct constructed format with staple evidence; 400 for the restriction/ban query; 50 per historical cube. Ties are alphabetical. Select the first 1,000 after deduplicating by Oracle ID and removing basics. Source printing rarity is factual metadata, not a generated rarity assignment. Digital reprints of paper cards are valid evidence; the snapshot records each printing's `digital` flag. Prices and Commander popularity are not strength proxies.

Resolve evidence against canonical names or front-face names, not every named face: a prepared spell called Ancestral Recall does not make its parent creature a Power Nine card. The importer rejects unresolved names instead of silently dropping them, uses batches of at most 75 identifiers, spaces requests, caches responses and backs off on HTTP 429. It never makes runtime application requests.

## What reaches generation

The pool contains 1,000 cards; **916** have a normal layout and one of the app's six supported types. Unsupported layouts and planeswalkers remain documented but are excluded from direct slot retrieval. Eligible references comprise 400 creatures, 138 lands, 123 instants, 115 artifacts, 106 sorceries and 34 enchantments.

Busted gets its own target and review policy. Fast mana, alternate-cost/free interaction, tutors, extra turns, reanimation and supported compact combos are intended possibilities. A ceiling finding needs evidence that the actual sequence overwhelms this powered environment; merely exceeding Modern Horizons rates or being banned in constructed is insufficient. Weak floors still need improvement, and contract/rules defects still block publication. Writers create original cards.

Retrieval matches type, gameplay role, mana band and color. A saved run seed rotates up to eight similarly scored candidates, preserving the choice through retries. Requests receive at most 48 references. Set-wide contexts cover every type first, and every inspected slot links to available same-type comparisons even when the payload fills. The brief receives Power Nine and selected interaction/enabler anchors. Other stages receive comparisons for their inspected slots.

Default keeps its Modern Horizons policy, catalog and slot curve. Busted gets separate inexpensive artifact, interaction and premium-engine opportunities. World diversity, literal prose, batch size, validation, contextual review, editing and collation remain shared.

## Reproduce and validate

```sh
# Python 3 and beautifulsoup4; cached sources avoid repeated downloads.
python3 scripts/busted-references/fetch.py
bun run test convex/draft/set/bustedReferences.test.ts convex/lobby/powerLevel.test.ts convex/draft/setGeneration.test.ts

# Optional paid full-set preview; not run for this implementation.
bun --env-file=.env.local scripts/preview-set.ts .artifacts/busted-preview --power-level=busted
```

The importer reads `.artifacts/busted-references/` when present. For a fresh snapshot, move that cache aside; review source counts, identities and printings before adopting the result. A preview directory freezes its power level and versions and rejects incompatible resumes. The historical prompt-7/8/9 eval commands refuse to run under prompt 10; their saved reports remain usable.

Tests establish plumbing, pool integrity, bounded retrieval and permission boundaries. Fake generated cards do not establish card quality or format balance. A real-provider pack comparison and human draft/playtest remain future validation.

Local verification: all 131 workspace tests, typecheck, lint and build pass. Two fake-service browser players verified the host-only control, readiness reset, refresh persistence and fifteen-card packs with the frozen Busted label. Screenshots and details are in the [implementation record](../../plans/completed/busted-power.md). No paid generation or deployment was performed.
