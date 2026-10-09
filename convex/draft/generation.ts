import { v } from "convex/values";
import { CardFace } from "../card";
import { internal } from "../_generated/api";
import { ActionCtx, internalAction } from "../_generated/server";
import { paintCard } from "./images";
import { requestPack, requestSetting } from "./openai";
import { parseCards, parseSetting } from "./parsing";
import { failureMessage } from "./retry";
import { Setting } from "./tables";

const illustrate = async (ctx: ActionCtx, card: CardFace): Promise<CardFace> => {
  const image = await paintCard(card.art_direction).catch(() => null);
  if (!image) return card;
  const storageId = await ctx.storage.store(image);
  return { ...card, image_url: await ctx.storage.getUrl(storageId) };
};

const illustrateAll = async (ctx: ActionCtx, cards: CardFace[]) => {
  const illustrated: CardFace[] = [];
  for (const card of cards) illustrated.push(await illustrate(ctx, card));
  return illustrated;
};

export const createSetting = internalAction({
  args: { lobbyId: v.id("lobbies"), attempt: v.number() },
  handler: async (ctx, { lobbyId, attempt }): Promise<void> => {
    try {
      const ideas: string[] = await ctx.runQuery(
        internal.draft.generated.ideas,
        { lobbyId }
      );
      const setting = parseSetting(await requestSetting(ideas));
      if (!setting) throw new Error("The setting came back malformed");
      await ctx.runMutation(internal.draft.generated.saveSetting, {
        lobbyId,
        setting,
      });
    } catch (error) {
      await ctx.runMutation(internal.draft.failures.record, {
        lobbyId,
        attempt,
        message: failureMessage(error),
      });
    }
  },
});

export const createPack = internalAction({
  args: {
    lobbyId: v.id("lobbies"),
    packId: v.id("packs"),
    attempt: v.number(),
  },
  handler: async (ctx, { lobbyId, packId, attempt }): Promise<void> => {
    try {
      const setting: Setting | null = await ctx.runQuery(
        internal.draft.generated.settingForPack,
        { packId }
      );
      if (!setting) throw new Error("The pack has no setting");
      const cards = parseCards(await requestPack(setting));
      if (cards.length === 0) throw new Error("The pack came back empty");
      await ctx.runMutation(internal.draft.generated.savePack, {
        packId,
        cards: await illustrateAll(ctx, cards),
      });
    } catch (error) {
      await ctx.runMutation(internal.draft.failures.record, {
        lobbyId,
        packId,
        attempt,
        message: failureMessage(error),
      });
    }
  },
});
