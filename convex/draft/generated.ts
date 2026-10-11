import { v } from "convex/values";
import { cardFace } from "../card";
import { Doc, Id } from "../_generated/dataModel";
import {
  internalMutation,
  internalQuery,
  MutationCtx,
  QueryCtx,
} from "../_generated/server";
import { listIdeas } from "../lobby/ideas";
import { attachSetting, isLive } from "../lobby/lifecycle";
import { dealRound, openRound, roundPacks } from "./rounds";
import { Setting, settingFields } from "./tables";

export type BriefCard = {
  id: Id<"cards">;
  art_direction: string;
  image_url: string | null;
};

export type PackBrief = { setting: Setting; cards: BriefCard[] };

const briefCard = (card: Doc<"cards">): BriefCard => ({
  id: card._id,
  art_direction: card.art_direction,
  image_url: card.image_url,
});

const settingFace = (setting: Doc<"settings">): Setting => ({
  name: setting.name,
  thesis: setting.thesis,
  description: setting.description,
  legendaryComponents: setting.legendaryComponents,
  newMechanic: setting.newMechanic,
  setArchetypes: setting.setArchetypes,
});

const cardsOf = (ctx: QueryCtx | MutationCtx, packId: Id<"packs">) =>
  ctx.db
    .query("cards")
    .withIndex("by_pack", (q) => q.eq("packId", packId))
    .collect();

const ownedPack = async (
  ctx: QueryCtx | MutationCtx,
  packId: Id<"packs">,
  key: string
) => {
  const pack = await ctx.db.get(packId);
  const lobby = pack && (await ctx.db.get(pack.lobbyId));
  if (!pack || pack.ready || pack.jobKey !== key) return null;
  if (!isLive(lobby) || !lobby.settingId) return null;
  return { pack, lobby, settingId: lobby.settingId };
};

const art = v.object({
  cardId: v.id("cards"),
  imageId: v.id("_storage"),
  image_url: v.string(),
});

export const ideas = internalQuery({
  args: { lobbyId: v.id("lobbies"), key: v.string() },
  handler: async (ctx, { lobbyId, key }): Promise<string[] | null> => {
    const lobby = await ctx.db.get(lobbyId);
    if (!isLive(lobby) || lobby.settingId || lobby.settingKey !== key) {
      return null;
    }
    return listIdeas(ctx, lobbyId);
  },
});

export const packBrief = internalQuery({
  args: { packId: v.id("packs"), key: v.string() },
  handler: async (ctx, { packId, key }): Promise<PackBrief | null> => {
    const owned = await ownedPack(ctx, packId, key);
    const setting = owned && (await ctx.db.get(owned.settingId));
    if (!setting) return null;
    const cards = await cardsOf(ctx, packId);
    return { setting: settingFace(setting), cards: cards.map(briefCard) };
  },
});

export const saveSetting = internalMutation({
  args: {
    lobbyId: v.id("lobbies"),
    key: v.string(),
    setting: v.object(settingFields),
  },
  handler: async (ctx, { lobbyId, key, setting }) => {
    const lobby = await ctx.db.get(lobbyId);
    if (!isLive(lobby) || lobby.settingId || lobby.settingKey !== key) return;
    const settingId = await ctx.db.insert("settings", { lobbyId, ...setting });
    await attachSetting(ctx, lobbyId, settingId);
    await dealRound(ctx, lobby, 1);
  },
});

export const saveDesign = internalMutation({
  args: {
    packId: v.id("packs"),
    key: v.string(),
    cards: v.array(v.object(cardFace)),
  },
  handler: async (ctx, { packId, key, cards }): Promise<BriefCard[] | null> => {
    const owned = await ownedPack(ctx, packId, key);
    if (!owned) return null;
    const existing = await cardsOf(ctx, packId);
    if (existing.length > 0) return existing.map(briefCard);
    const saved: BriefCard[] = [];
    for (const card of cards) {
      const id = await ctx.db.insert("cards", {
        settingId: owned.settingId,
        lobbyId: owned.lobby._id,
        packId,
        pickedBy: null,
        ...card,
      });
      saved.push({ id, art_direction: card.art_direction, image_url: null });
    }
    return saved;
  },
});

export const saveArt = internalMutation({
  args: { packId: v.id("packs"), key: v.string(), art: v.array(art) },
  handler: async (ctx, { packId, key, art }) => {
    const owned = await ownedPack(ctx, packId, key);
    for (const piece of art) {
      const card = owned && (await ctx.db.get(piece.cardId));
      if (card && card.packId === packId && card.image_url === null) {
        await ctx.db.patch(piece.cardId, {
          imageId: piece.imageId,
          image_url: piece.image_url,
        });
      } else {
        await ctx.storage.delete(piece.imageId);
      }
    }
  },
});

export const finishPack = internalMutation({
  args: { packId: v.id("packs"), key: v.string() },
  handler: async (ctx, { packId, key }) => {
    const owned = await ownedPack(ctx, packId, key);
    if (!owned) return;
    const cards = await cardsOf(ctx, packId);
    if (cards.length === 0) return;
    await ctx.db.patch(packId, { cardCount: cards.length, ready: true });
    const packs = await roundPacks(ctx, owned.lobby._id, owned.pack.round);
    if (packs.every((dealt) => dealt.ready)) {
      await openRound(ctx, owned.lobby, owned.settingId, packs);
    }
  },
});
