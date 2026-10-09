import { Id } from "../_generated/dataModel";
import { MutationCtx, QueryCtx } from "../_generated/server";

export const findOwnDeck = async (
  ctx: QueryCtx | MutationCtx,
  userId: Id<"users">,
  deckId: Id<"decks">
) => {
  const deck = await ctx.db.get(deckId);
  return deck && deck.userId === userId ? deck : null;
};
