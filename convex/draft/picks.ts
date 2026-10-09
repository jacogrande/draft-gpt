import { v } from "convex/values";
import { pickFace } from "../card";
import { mutation, query } from "../_generated/server";
import { addDraftedCard } from "../deck/drafted";
import { reject } from "../errors";
import { loadLobby, viewAsMember } from "../lobby/access";
import { requireViewer } from "../identity/viewer";
import {
  currentPack,
  packsHeld,
  passPack,
  ROUND_COUNT,
  roundIsOver,
} from "./passing";
import { dealRound, roundPacks } from "./rounds";

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

    const passed = passPack(pack);
    await ctx.db.patch(cardId, { pickedBy: userId });
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
    const cards = await ctx.db
      .query("cards")
      .withIndex("by_pack", (q) => q.eq("packId", pack._id))
      .collect();
    return {
      packId: pack._id,
      cards: cards
        .filter((card) => card.pickedBy === null)
        .map((card) => ({ id: card._id, ...pickFace(card) })),
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
