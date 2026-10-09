# Game lobbies on Convex

Status: implemented
Date: 2026-10-09
Covers: step 3 of `refactor-roadmap.md`

## What it does

A game is a two-player table found by a four-character code. It lives in Convex in the `convex/game` domain, built the way draft lobbies were: seats are durable, presence is display only, and every change is one server transaction. Firestore is no longer used.

## Rules

- **Seats.** `join` is idempotent. A player who refreshes or closes the tab returns to the same seat, deck, life total, and board. A third player is refused by the server, including by direct URL.
- **Leaving.** A player can leave until the game starts. The last player to leave closes the game. Nobody can leave a game in progress.
- **Starting.** Each player chooses one of their own decks by id. The server copies its mainboard, shuffles it, and the game becomes `playing` when both have chosen.
- **One table, two views.** Both players read the same rows. The server sends each player their own hand, both battlefields and graveyards, and only the size of the opponent's hand and of both libraries.
- **Own pieces only.** A player can move, tap, and draw their own cards, set their own life total, and change their own tokens and counters. A request that names the other player's card does nothing.
- **Zones.** A card moved to the library goes on top. A card that leaves the battlefield untaps.
- **Log.** The server writes the log in the same transaction as the action. A moved card is named only if it started or ended on the battlefield or in the graveyard; otherwise it is "a card".
- **Cleanup.** A daily cron closes games older than seven days. Finding a game by code skips closed games and prefers the newest.

## Not covered

Still no turns, phases, or legality checks (`product-vision.md`). Token positions are not stored, and counter positions are in the owner's screen coordinates; both belong to step 4.

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
