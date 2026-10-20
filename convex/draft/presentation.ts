import { CardFace } from "../card";
import { QueryCtx } from "../_generated/server";

export const withDesignArt = async <T extends CardFace>(
  ctx: QueryCtx,
  cards: T[]
): Promise<T[]> => {
  const images = new Map<string, string | null>();
  for (const card of cards)
    if (card.designId && !images.has(card.designId)) {
      const design = await ctx.db.get(card.designId);
      images.set(card.designId, design?.card?.image_url ?? null);
    }
  return cards.map((card) =>
    card.designId && images.get(card.designId)
      ? { ...card, image_url: images.get(card.designId)! }
      : card
  );
};
