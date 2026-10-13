# Refactoring Draft GPT

## Purpose
This is an old project I rolled out myself, by hand. Now, we have intelligent agentic coding tools and techniques that allow for enterprise level development and resilience even when you're just a solo dev.

There are bugs, bad features, outdated api calls, old llm model invocations, etc that all need to be improved.

## Current position (2026-10-12)

Steps 1 and 3 are complete; step 4 is implemented and verified locally. Step 2 needs a full real production draft to close its acceptance check. Step 5 is also implemented and verified locally, with the final gaps fixed after an acceptance review. Step 6's card-design rebuild has not started, although card art has already been upgraded separately.

Step 4 was committed and pushed as `5eab01e`. The step 5 completion work follows it. Pushed code does not by itself establish what is deployed to production.

## Step 1: Draft Lobbies

Status: done (2026-10-09). See `draft-lobby-refactor.md` and `convex-rewrite.md`.

Take another look at our lobby system. Can we improve it? Is firebase still the right system? Our heartbeat system was causing problems in lobbies for people. Users who are authenticated should be able to close the tab and rejoin at any point. 

Look at https://github.com/misty-step/parlor. Is this a better system for lobbies? We could use Convex, etc.

## Step 2: Drafting

Status: in progress.

Let's ensure our draft process is robust. The server shouldn't fail, players shouldn't get stuck or skipped. If someone disconnects during the draft, we need to handle it gracefully.

Done: server-side generation with retries, transactional picks, automatic rounds, a reconnect countdown with host pause and skip, automatic picks for absent players, and recovery from a generation step that dies silently. October 11 hardening added keys to reject superseded generation steps, saved card designs before painting, honoured rate-limit waits, and expanded integration coverage.

Remaining:

- Run one real draft on production.

Card design keeps the 2024 model and prompts for now; rebuilding it is step 6.

## Step 3: Game Lobbies

Status: done (2026-10-09). See `game-lobbies.md`.

Ensure that game state is properly handled in game lobbies. The same logic and changes we made in Draft lobbies should apply here. Ensure all game states can be represented and are identical in both instances.

## Step 4: Game View

Status: implemented and verified locally (2026-10-12); not yet deployed.

Both players now see a consistent table across different desktop window sizes. See [game-lobbies.md](game-lobbies.md#table-view) for placement, compatibility, and interaction details. The app remains a manual table without turns or legality checks.

Delivered:

- Shared token and counter positions relative to their owner's battlefield area, mirrored into the opponent's view. Positions survive refreshes, resizing, and another session for the same player; rejected moves revert with an error message.
- One battlefield layout for both players. Cards retain automatic land/spell rows, reversed across the table; arbitrary card placement is intentionally outside this step.
- Card drag previews that stay visible outside scroll containers, multi-card drags, specific zone targets, and clean invalid-drop behavior. Opponent cards can be previewed but cannot enter the player's selection.
- Inspection and preview of both public graveyards, with movement controls only for the owner.
- Independently scrolling hands, card rows, table, and sidebar. Crowded boards and large hands do not widen the document. Tapped cards have space to rotate; tokens, library controls, and menus respect the theme.
- Menus rendered above the table and kept inside the viewport. Token, counter, and life editing does not trigger table shortcuts. Earlier October 11 interaction fixes remain in place.

Validation on the local fake-service stack used separate Ana and Ben browser sessions, plus a second Ana session. Checked shared token movement and tapping, counter movement and edits, refresh and resize, cross-session updates, card dragging/tapping, selected-pair movement, both graveyard views, owner-only graveyard controls, life edits and logs, input shortcut guards, menus at the viewport edge, and recovery from an intentionally rejected token move. An 18-card hand and crowded battlefield stayed within 1280×800 and 1440×900 windows; both themes were inspected.

Backend integration coverage verifies ownership, shared placement, bounds, invalid coordinates, closed games, and legacy counter compatibility. Pure coordinate tests cover mirroring and different field sizes. `bun run test` passes all 87 tests; typecheck, lint, and the production build pass. Production deployment is separate from this local acceptance.

## Step 5: The deckbuilder

Status: implemented and verified locally (2026-10-12); not yet deployed. See [deckbuilder.md](deckbuilder.md) for behavior and acceptance.

The earlier migration and October 11 fixes delivered persistent editing, Add Lands, loading/not-found states, basic-land limits, and drag snapback. The completion audit found remaining correctness and usability gaps, now fixed:

- Automatic lands are calculated transactionally from the current mainboard. Repeated or concurrent calls fill only the missing slots up to 17, account for existing basics and nonbasic land counts, and ignore sideboard costs.
- Braced, hybrid, multi-digit, and variable costs parse consistently for land suggestions and mana-value grouping. Decks without colored costs get manual-land guidance instead of a crash.
- Stacks and List views include counts, land/spell totals, previews, clear mana-value headings, and explicit move/remove controls.
- Independent mainboard/sidebar scrolling keeps a large deck usable. Dragging uses the current pointer target after scrolling or resizing; the preview no longer accidentally accepts sideboard drops.
- Rejected moves show an error and preserve the saved cards. Individual land controls respect the existing storage cap.

Browser acceptance covered editing out and back, refresh persistence, basic removal and exact auto-fill, manual additions, both views and themes, scrolling/resizing, invalid drops, rejection recovery, and an outsider's not-found screen. Integration tests cover land allocation, repeated/concurrent calls, ownership, and storage limits. This closes the original step 5 scope; additional deckbuilder features need their own requirements.

## Step 6: Card creation

Status: card-design rebuild not started; card art upgraded separately. See [card-art.md](card-art.md).

Rebuild the card creation system. The model (`gpt-4o`) and the setting and pack prompts are the 2024 originals, moved to Convex without change. Until this step we keep using what we have.
