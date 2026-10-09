import { v } from "convex/values";
import { CardFace } from "../card";
import { internal } from "../_generated/api";
import { ActionCtx, internalAction } from "../_generated/server";
import { artPrompt } from "./artPrompt";
import { pickSchool } from "./artSchools";
import { paintCard } from "./images";
import { requestPack, requestSetting } from "./openai";
import { parseCards, parseSetting } from "./parsing";
import { failureMessage } from "./retry";
import { Setting } from "./tables";

const PAINTERS_AT_ONCE = 4;

const paint = (card: CardFace, setting: Setting) =>
  paintCard(
    artPrompt(card.art_direction, setting, pickSchool(Math.random()))
  ).catch(() => null);

const paintAll = async (cards: CardFace[], setting: Setting) => {
  const paintings: (Blob | null)[] = [];
  for (let start = 0; start < cards.length; start += PAINTERS_AT_ONCE) {
    const batch = cards.slice(start, start + PAINTERS_AT_ONCE);
    paintings.push(
      ...(await Promise.all(batch.map((card) => paint(card, setting))))
    );
  }
  return paintings;
};

const illustrateAll = async (
  ctx: ActionCtx,
  cards: CardFace[],
  setting: Setting
) => {
  const paintings = await paintAll(cards, setting);
  const illustrated: CardFace[] = [];
  for (const [index, card] of cards.entries()) {
    const painting = paintings[index];
    const storageId = painting && (await ctx.storage.store(painting));
    const image_url = storageId ? await ctx.storage.getUrl(storageId) : null;
    illustrated.push({ ...card, image_url });
  }
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
        cards: await illustrateAll(ctx, cards, setting),
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
