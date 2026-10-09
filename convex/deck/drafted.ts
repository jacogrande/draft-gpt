import { CardFace, pickFace } from "../card";
import { Doc, Id } from "../_generated/dataModel";
import { MutationCtx } from "../_generated/server";

export const addDraftedCard = async (
  ctx: MutationCtx,
  userId: Id<"users">,
  lobby: Doc<"lobbies">,
  card: CardFace & { _id: Id<"cards"> }
) => {
  const drafted = { id: card._id, ...pickFace(card) };
  const deck = await ctx.db
    .query("decks")
    .withIndex("by_user_lobby", (q) =>
      q.eq("userId", userId).eq("lobbyId", lobby._id)
    )
    .unique();
  if (deck) {
    await ctx.db.patch(deck._id, { cards: [...deck.cards, drafted] });
    return;
  }
  await ctx.db.insert("decks", {
    userId,
    lobbyId: lobby._id,
    name: lobby.name,
    cards: [drafted],
    sideboard: [],
  });
};
