import { v } from "convex/values";
import { cardFace } from "../card";
import { internalMutation, internalQuery } from "../_generated/server";
import { dealRound, openRound, roundPacks } from "./rounds";
import { Setting, settingFields } from "./tables";

export const ideas = internalQuery({
  args: { lobbyId: v.id("lobbies") },
  handler: async (ctx, { lobbyId }): Promise<string[]> => {
    const messages = await ctx.db
      .query("lobbyMessages")
      .withIndex("by_lobby", (q) => q.eq("lobbyId", lobbyId))
      .collect();
    return messages.map((message) => message.text);
  },
});

export const settingForPack = internalQuery({
  args: { packId: v.id("packs") },
  handler: async (ctx, { packId }): Promise<Setting | null> => {
    const pack = await ctx.db.get(packId);
    const lobby = pack && (await ctx.db.get(pack.lobbyId));
    const setting = lobby?.settingId && (await ctx.db.get(lobby.settingId));
    if (!setting) return null;
    return {
      name: setting.name,
      thesis: setting.thesis,
      description: setting.description,
      legendaryComponents: setting.legendaryComponents,
      newMechanic: setting.newMechanic,
      setArchetypes: setting.setArchetypes,
    };
  },
});

export const saveSetting = internalMutation({
  args: { lobbyId: v.id("lobbies"), setting: v.object(settingFields) },
  handler: async (ctx, { lobbyId, setting }) => {
    const lobby = await ctx.db.get(lobbyId);
    if (!lobby || lobby.settingId) return;
    const settingId = await ctx.db.insert("settings", { lobbyId, ...setting });
    await ctx.db.patch(lobbyId, { settingId });
    await dealRound(ctx, lobby, 1);
  },
});

export const savePack = internalMutation({
  args: { packId: v.id("packs"), cards: v.array(v.object(cardFace)) },
  handler: async (ctx, { packId, cards }) => {
    const pack = await ctx.db.get(packId);
    const lobby = pack && (await ctx.db.get(pack.lobbyId));
    if (!pack || pack.ready || !lobby?.settingId) return;
    for (const card of cards) {
      await ctx.db.insert("cards", {
        settingId: lobby.settingId,
        lobbyId: lobby._id,
        packId,
        pickedBy: null,
        ...card,
      });
    }
    await ctx.db.patch(packId, { cardCount: cards.length, ready: true });
    const packs = await roundPacks(ctx, lobby._id, pack.round);
    if (packs.every((dealt) => dealt.ready)) {
      await openRound(ctx, lobby, lobby.settingId, packs);
    }
  },
});
