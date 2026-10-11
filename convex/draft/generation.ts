import { v } from "convex/values";
import { internal } from "../_generated/api";
import { Id } from "../_generated/dataModel";
import { ActionCtx, internalAction } from "../_generated/server";
import { artPrompt } from "./artPrompt";
import { pickSchool } from "./artSchools";
import { BriefCard, PackBrief } from "./generated";
import { paintCard } from "./images";
import { requestPack, requestSetting } from "./openai";
import { parseCards, parseSetting } from "./parsing";
import { trimPack } from "./passing";
import { failureMessage, retryAdvice } from "./retry";
import { Setting } from "./tables";

const PAINTERS_AT_ONCE = 4;
const PACK_BUDGET_MS = 9 * 60_000;

type Art = { cardId: Id<"cards">; imageId: Id<"_storage">; image_url: string };

const paintBatch = async (
  ctx: ActionCtx,
  cards: BriefCard[],
  setting: Setting,
  deadline: number
): Promise<Art[]> => {
  const paintings = await Promise.all(
    cards.map((card) =>
      paintCard(
        artPrompt(card.art_direction, setting, pickSchool(Math.random())),
        deadline
      )
    )
  );
  const art: Art[] = [];
  for (const [index, card] of cards.entries()) {
    const painting = paintings[index];
    if (!painting) continue;
    const imageId = await ctx.storage.store(painting);
    const image_url = await ctx.storage.getUrl(imageId);
    if (image_url) art.push({ cardId: card.id, imageId, image_url });
  }
  return art;
};

const paintAll = async (
  ctx: ActionCtx,
  packId: Id<"packs">,
  key: string,
  cards: BriefCard[],
  setting: Setting,
  deadline: number
) => {
  let painted = 0;
  for (let start = 0; start < cards.length; start += PAINTERS_AT_ONCE) {
    if (Date.now() >= deadline) break;
    const batch = cards.slice(start, start + PAINTERS_AT_ONCE);
    const art = await paintBatch(ctx, batch, setting, deadline);
    painted += art.length;
    if (art.length > 0) {
      await ctx.runMutation(internal.draft.generated.saveArt, {
        packId,
        key,
        art,
      });
    }
  }
  if (painted < cards.length) {
    console.warn(`${cards.length - painted} cards in pack ${packId} have no art`);
  }
};

export const createSetting = internalAction({
  args: { lobbyId: v.id("lobbies"), attempt: v.number(), key: v.string() },
  handler: async (ctx, { lobbyId, attempt, key }): Promise<void> => {
    try {
      const ideas: string[] | null = await ctx.runQuery(
        internal.draft.generated.ideas,
        { lobbyId, key }
      );
      if (!ideas) return;
      const setting = parseSetting(await requestSetting(ideas));
      if (!setting) throw new Error("The setting came back malformed");
      await ctx.runMutation(internal.draft.generated.saveSetting, {
        lobbyId,
        key,
        setting,
      });
    } catch (error) {
      await ctx.runMutation(internal.draft.failures.record, {
        lobbyId,
        attempt,
        key,
        message: failureMessage(error),
        retryAfterMs: retryAdvice(error),
      });
    }
  },
});

export const createPack = internalAction({
  args: {
    lobbyId: v.id("lobbies"),
    packId: v.id("packs"),
    attempt: v.number(),
    key: v.string(),
  },
  handler: async (ctx, { lobbyId, packId, attempt, key }): Promise<void> => {
    const deadline = Date.now() + PACK_BUDGET_MS;
    try {
      const brief: PackBrief | null = await ctx.runQuery(
        internal.draft.generated.packBrief,
        { packId, key }
      );
      if (!brief) return;
      let cards = brief.cards;
      if (cards.length === 0) {
        const designed = trimPack(parseCards(await requestPack(brief.setting)));
        if (!designed) throw new Error("The pack came back with too few cards");
        const saved: BriefCard[] | null = await ctx.runMutation(
          internal.draft.generated.saveDesign,
          { packId, key, cards: designed }
        );
        if (!saved) return;
        cards = saved;
      }
      const unpainted = cards.filter((card) => card.image_url === null);
      await paintAll(ctx, packId, key, unpainted, brief.setting, deadline);
      await ctx.runMutation(internal.draft.generated.finishPack, { packId, key });
    } catch (error) {
      await ctx.runMutation(internal.draft.failures.record, {
        lobbyId,
        packId,
        attempt,
        key,
        message: failureMessage(error),
        retryAfterMs: retryAdvice(error),
      });
    }
  },
});
