import { v } from "convex/values";
import { pickFace } from "../card";
import { mutation, query } from "../_generated/server";
import { reject } from "../errors";
import { loadLobby, viewAsMember } from "../lobby/access";
import { requireViewer } from "../identity/viewer";
import { runAutopilot } from "./autopilot";
import { currentPack, packsHeld } from "./passing";
import { takeCard, unpickedCards } from "./picking";
import { roundPacks } from "./rounds";

export const pick = mutation({
  args: { cardId: v.id("cards") },
  handler: async (ctx, { cardId }) => {
    const userId = await requireViewer(ctx);
    const card = (await ctx.db.get(cardId)) ?? reject("CARD_NOT_AVAILABLE");
    if (card.pickedBy !== null) reject("CARD_NOT_AVAILABLE");
    const lobby = await loadLobby(ctx, card.lobbyId);
    if (lobby.status !== "drafting") reject("NOT_DRAFTING");

    const packs = await roundPacks(ctx, lobby._id, lobby.round);
    const pack = currentPack(packs, userId);
    if (!pack || pack._id !== card.packId) return reject("NOT_YOUR_PACK");

    await takeCard(ctx, lobby, packs, pack, card, userId);
    await runAutopilot(ctx, lobby._id);
  },
});

export const current = query({
  args: { lobbyId: v.id("lobbies") },
  handler: async (ctx, { lobbyId }) => {
    const view = await viewAsMember(ctx, lobbyId);
    if (view?.lobby.status !== "drafting") return null;
    const pack = currentPack(
      await roundPacks(ctx, lobbyId, view.lobby.round),
      view.userId
    );
    if (!pack) return null;
    const cards = await unpickedCards(ctx, pack._id);
    return {
      packId: pack._id,
      cards: cards.map((card) => ({ id: card._id, ...pickFace(card) })),
    };
  },
});

export const held = query({
  args: { lobbyId: v.id("lobbies") },
  handler: async (ctx, { lobbyId }): Promise<Record<string, number>> => {
    const view = await viewAsMember(ctx, lobbyId);
    if (view?.lobby.status !== "drafting") return {};
    return packsHeld(await roundPacks(ctx, lobbyId, view.lobby.round));
  },
});
