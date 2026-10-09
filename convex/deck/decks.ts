import { v } from "convex/values";
import { Doc, Id } from "../_generated/dataModel";
import { mutation, MutationCtx, query } from "../_generated/server";
import { reject } from "../errors";
import { findViewer, requireViewer } from "../identity/viewer";
import { findOwnDeck } from "./owned";
import { basicLand, toMainboard, toSideboard } from "./zones";

const landType = v.union(
  v.literal("plains"),
  v.literal("forest"),
  v.literal("mountain"),
  v.literal("swamp"),
  v.literal("island")
);

const present = (deck: Doc<"decks">) => ({
  id: deck._id,
  lobbyId: deck.lobbyId,
  name: deck.name,
  cards: deck.cards,
  sideboard: deck.sideboard,
  createdAt: deck._creationTime,
});

const requireOwnDeck = async (ctx: MutationCtx, deckId: Id<"decks">) => {
  const userId = await requireViewer(ctx);
  return (await findOwnDeck(ctx, userId, deckId)) ?? reject("DECK_NOT_FOUND");
};

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await findViewer(ctx);
    if (!userId) return [];
    const decks = await ctx.db
      .query("decks")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    return decks.map(present);
  },
});

export const get = query({
  args: { deckId: v.id("decks") },
  handler: async (ctx, { deckId }) => {
    const userId = await findViewer(ctx);
    const deck = userId && (await findOwnDeck(ctx, userId, deckId));
    return deck ? present(deck) : null;
  },
});

export const forLobby = query({
  args: { lobbyId: v.id("lobbies") },
  handler: async (ctx, { lobbyId }) => {
    const userId = await findViewer(ctx);
    if (!userId) return null;
    const deck = await ctx.db
      .query("decks")
      .withIndex("by_user_lobby", (q) =>
        q.eq("userId", userId).eq("lobbyId", lobbyId)
      )
      .unique();
    return deck ? present(deck) : null;
  },
});

export const moveToSideboard = mutation({
  args: { deckId: v.id("decks"), cardId: v.string() },
  handler: async (ctx, { deckId, cardId }) => {
    const deck = await requireOwnDeck(ctx, deckId);
    const zones = toSideboard(deck, cardId) ?? reject("CARD_NOT_IN_DECK");
    await ctx.db.patch(deckId, zones);
  },
});

export const moveToMainboard = mutation({
  args: { deckId: v.id("decks"), cardId: v.string() },
  handler: async (ctx, { deckId, cardId }) => {
    const deck = await requireOwnDeck(ctx, deckId);
    const zones = toMainboard(deck, cardId) ?? reject("CARD_NOT_IN_DECK");
    await ctx.db.patch(deckId, zones);
  },
});

export const addBasics = mutation({
  args: { deckId: v.id("decks"), lands: v.array(landType) },
  handler: async (ctx, { deckId, lands }) => {
    const deck = await requireOwnDeck(ctx, deckId);
    const basics = lands.map((land) => basicLand(land, crypto.randomUUID()));
    await ctx.db.patch(deckId, { cards: [...deck.cards, ...basics] });
  },
});
