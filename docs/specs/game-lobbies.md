# Game lobbies on Convex

Status: implemented
Date: 2026-10-09
Covers: step 3 of `refactor-roadmap.md`

## What it does

A game is a two-player table found by a four-character code. It lives in Convex in the `convex/game` domain, built the way draft lobbies were: seats are durable, presence is display only, and every change is one server transaction. Firestore is no longer used.

## Rules

- **Codes.** The server gives each new game a four-character code of letters and digits, drawn again until no open or playing game has it. Finding a game by code skips closed games and prefers the newest.
- **Seats.** `join` is idempotent. A player who refreshes or closes the tab returns to the same seat, deck, life total, and board. A third player is refused by the server, including by direct URL. A closed game refuses everyone, former players included.
- **Leaving.** A player can leave until the game starts. The last player to leave closes the game. Nobody can leave a game in progress.
- **Starting.** Each player chooses one of their own decks by id. The server copies its mainboard, shuffles it, and the game becomes `playing` when both have chosen.
- **One table, two views.** Both players read the same rows. The server sends each player their own hand, both battlefields and graveyards, and only the size of the opponent's hand and of both libraries.
- **Own pieces only.** A player can move, tap, and draw their own cards, set their own life total, and change their own tokens and counters. A request that names the other player's card does nothing.
- **Only while playing.** Cards, life, tokens, and counters can be changed only while the game is `playing`. A closed game is read-only; the server refuses with `GAME_CLOSED`.
- **Zones.** A card moved to the library goes on top. A card that leaves the battlefield untaps. A draw of nothing, or of a nonsense amount, draws no cards and is not logged.
- **Log.** The server writes the log in the same transaction as the action, for every action: joining, leaving, choosing a deck, moving, tapping, drawing, shuffling, life totals, tokens, and counters. A moved card is named only if it started or ended on the battlefield or in the graveyard; otherwise it is "a card".
- **Cleanup.** A game is idle from the last time a player was seen in it (its creation, if nobody has been). A daily cron closes open games idle for a day and playing games idle for a week, and a second one deletes games closed for a week along with their seats, log, tokens, counters, and presence.
- **Malformed ids.** A query given something that is not a game or deck id returns nothing rather than failing.

## Not covered

Still no turns, phases, or legality checks (`product-vision.md`). Free card placement, card attachments, and rules enforcement are outside the table view.

## Table view

Implemented locally on 2026-10-12 (roadmap step 4).

Both fields use the same component. Cards are arranged automatically in land and spell rows. The opponent's rows reverse their order and their card faces rotate across the table. Tapped cards reserve enough space for their rotated face. Hands and rows scroll horizontally inside the page; the table and sidebar scroll vertically when needed.

Tokens and counters occupy a shared area within their owner's battlefield. Positions are fractions from 0 to 1 of the available travel in each axis, accounting for the piece's size. `game/placement.ts` clamps finite positions, converts between fractions and pixels, and mirrors both axes for the opponent. A resize observer measures each viewer's own area. Moving a piece commits once at release and writes a log entry; failed saves revert to the server position and show a toast. Incoming changes update other sessions without a refresh.

Tokens have an optional `position`. Older tokens without one receive deterministic starting positions. Counters retain their `position` field and add `positionSpace: "battlefield"`; older viewport coordinates cannot be recovered across unknown screen sizes, so those counters receive deterministic starting positions until moved. No destructive data migration is needed.

Both players can open either graveyard and preview its cards. Only the owner gets drag and movement controls. The opponent's cards cannot be selected for the viewer's keyboard commands. Hands and library orders retain the server's existing privacy boundary.

Card drags use a floating preview above scroll containers. The pointer chooses a destination, with hand, library, and graveyard checked before the broader battlefield. A selected group moves together; a same-zone or invalid drop returns to the automatic layout. Library and context menus render above the table, fit inside the viewport, and use the active theme.

## Acceptance

Checked on the local stack with three browser sessions; the same behaviour is covered by `convex/game/*.test.ts`.

1. Ana creates a game; Ben finds it by typing the code in lower case.
2. A third player who opens the URL is told the game is full.
3. A player who leaves before the start disappears from the other's list and frees the seat.
4. After both choose a deck the table opens with 45 cards in each library.
5. Ana draws seven: she sees seven cards, Ben sees "7 in hand" and none of the cards.
6. Ana drags a card to the battlefield, taps it, and untaps it; Ben sees each change and the log names the card.
7. Ana changes her life total; Ben sees it.
8. Ana creates a counter and a token and taps the token; Ben sees both and the tapped state.
9. Ben closes the tab and reopens the game URL: same seat, same board.
