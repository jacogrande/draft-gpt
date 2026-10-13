# Deckbuilder

Status: implemented and verified locally, 2026-10-12. Covers step 5 of the refactor roadmap; not yet deployed.

## Editing a deck

The editor shows the deck name, mainboard and sideboard counts, and mainboard land/spell totals. Cards are grouped by mana value. Stacks expose card names for browsing and dragging; List exposes each card with an explicit Sideboard or Remove button. Hovering or focusing a card updates the preview.

The mainboard and sidebar scroll independently within the viewport. Dropping a mainboard card onto the sideboard, double-clicking its stack face, or using its list control moves it to the sideboard. Clicking a sideboard card returns it. Basic lands are removed instead of sideboarded. The preview is not a drop target, and drop targets are resolved at the pointer's current position after scrolling or resizing. Drags render a floating preview above scroll containers and invalid drops snap back.

Edits use owner-checked Convex mutations. Screens show loading and not-found states, including for an inaccessible deck. A rejected edit leaves saved cards unchanged and shows an error. Another tab and a refresh show the saved deck.

## Basic lands

Individual controls add any of the five basic land types. Existing backend limits remain: at most 40 basics per request and no additions beyond 150 mainboard cards. These are storage safeguards, not deck legality rules.

Add Lands tops the mainboard up to 17 lands in one transaction. `convex/deck/manaBase.ts` plans additions from the current saved mainboard, so repeated or concurrent calls cannot top up the same missing slots twice. Sideboard costs do not influence the suggestion.

Each colored mana symbol contributes weight to its color. Hybrid symbols divide their weight among the colors they offer. The planner adds the color furthest below its weighted share, accounting for existing basics; all existing lands, including nonbasics, count toward the target. It never removes or replaces existing lands and does not infer the mana abilities of generated nonbasics.

Generic, variable, colorless, snow, and unknown non-color symbols do not request colored basics. If the deck has no colored costs, Add Lands leaves it unchanged and asks the player to choose basics manually. If 17 lands are already present, it adds nothing. The target is a convenience, not a rules check; manual additions remain available within the storage cap.

`convex/mana.ts` shares cost tokenization between the planner, displayed mana symbols, and mana-value grouping. Multi-digit generic values and braced hybrid/Phyrexian costs are handled as symbols rather than individual punctuation characters.

## Acceptance

Verified using local fake-service decks, signed-in Ana and Ben browser sessions, and backend tests:

1. Ana opens her deck from the deck list. Ben opening Ana's URL sees Deck not found. Malformed ids also return nothing.
2. Stacks and List show matching cards and counts, with card previews, visible mana-value headings, and explicit movement controls in List.
3. Move a spell out and back, then reload. Counts and saved cards agree. Removing a basic does not put it in the sideboard.
4. Drag after scrolling and resizing: the actual sideboard accepts the card, the preview does not, and an invalid drop preserves the deck.
5. Remove one basic from a 17-land deck and use Add Lands: exactly one is restored. A manual addition survives refresh. Backend tests cover concurrent calls, mixed colors, braced/hybrid costs, nonbasic lands, colorless decks, and ownership.
6. A deliberately rejected move preserves the card and displays an error.
7. A 62-card deck remains reachable without document-wide overflow at 1280×800 and 1440×900. Light and dark views are readable.

Validation commands pass: `bun run test` (90 tests), `bun run typecheck`, `bun run lint`, and `bun run build`.

No automatic deck-size enforcement, legality validation, or card-design changes belong to this step.
