import { Doc, Id } from "../_generated/dataModel";
import { MutationCtx, QueryCtx } from "../_generated/server";
import { addDraftedCard } from "../deck/drafted";
import { passPack, ROUND_COUNT, roundIsOver } from "./passing";
import { dealRound } from "./rounds";

export const unpickedCards = async (
  ctx: QueryCtx | MutationCtx,
  packId: Id<"packs">
) => {
  const cards = await ctx.db
    .query("cards")
    .withIndex("by_pack", (q) => q.eq("packId", packId))
    .collect();
  return cards.filter((card) => card.pickedBy === null);
};

export const takeCard = async (
  ctx: MutationCtx,
  lobby: Doc<"lobbies">,
  packs: Doc<"packs">[],
  pack: Doc<"packs">,
  card: Doc<"cards">,
  userId: Id<"users">
) => {
  const passed = passPack(pack);
  await ctx.db.patch(card._id, { pickedBy: userId });
  await ctx.db.patch(pack._id, passed);
  await addDraftedCard(ctx, userId, lobby, card);

  const afterPick = packs.map((dealt) =>
    dealt._id === pack._id ? { ...dealt, ...passed } : dealt
  );
  if (!roundIsOver(afterPick)) return;
  if (lobby.round >= ROUND_COUNT) {
    await ctx.db.patch(lobby._id, { status: "complete" });
  } else {
    await dealRound(ctx, lobby, lobby.round + 1);
  }
};
