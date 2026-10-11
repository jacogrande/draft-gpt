import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { findOwnDeck } from "../deck/owned";
import { reject } from "../errors";
import { loadPlayers, requirePlayer } from "./access";
import { record } from "./log";
import { everyoneHasADeck } from "./seats";
import { dealIn } from "./table";

export const chooseDeck = mutation({
  args: { gameId: v.id("games"), deckId: v.id("decks") },
  handler: async (ctx, { gameId, deckId }) => {
    const { userId, game, player } = await requirePlayer(ctx, gameId);
    if (game.status !== "open") reject("GAME_NOT_OPEN");
    const deck =
      (await findOwnDeck(ctx, userId, deckId)) ?? reject("DECK_NOT_FOUND");
    await ctx.db.patch(player._id, {
      side: dealIn(player.seat, deck.cards, Math.random),
    });
    await record(ctx, gameId, userId, [`chose ${deck.name}`]);

    const players = await loadPlayers(ctx, gameId);
    const ready = players.map((seat) => ({ ready: seat.side !== null }));
    if (everyoneHasADeck(ready)) {
      await ctx.db.patch(gameId, { status: "playing" });
    }
  },
});
