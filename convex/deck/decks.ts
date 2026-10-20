import { withDesignArt } from "../draft/presentation";
import { v } from "convex/values";
import { Doc, Id } from "../_generated/dataModel";
import { mutation, MutationCtx, QueryCtx, query } from "../_generated/server";
import { reject } from "../errors";
import { findViewer, requireViewer } from "../identity/viewer";
import { planBasics } from "./manaBase";
import { findOwnDeck } from "./owned";
import { toMainboard, toSideboard, withBasics } from "./zones";

const landType = v.union(
  v.literal("plains"),
  v.literal("forest"),
  v.literal("mountain"),
  v.literal("swamp"),
  v.literal("island")
);

const present = async (ctx: QueryCtx, deck: Doc<"decks">) => ({
  id: deck._id,
  lobbyId: deck.lobbyId,
  name: deck.name,
  cards: await withDesignArt(ctx, deck.cards),
  sideboard: await withDesignArt(ctx, deck.sideboard),
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
    return Promise.all(decks.map((deck) => present(ctx, deck)));
  },
});

export const get = query({
  args: { deckId: v.string() },
  handler: async (ctx, args) => {
    const deckId = ctx.db.normalizeId("decks", args.deckId);
    const userId = deckId && (await findViewer(ctx));
    const deck = userId && (await findOwnDeck(ctx, userId, deckId));
    return deck ? present(ctx, deck) : null;
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
      .first();
    return deck ? present(ctx, deck) : null;
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
    await ctx.db.patch(deckId, {
      cards: withBasics(deck.cards, lands, () => crypto.randomUUID()),
    });
  },
});

export const autoAddBasics = mutation({
  args: { deckId: v.id("decks") },
  handler: async (ctx, { deckId }) => {
    const deck = await requireOwnDeck(ctx, deckId);
    const plan = planBasics(deck.cards);
    await ctx.db.patch(deckId, {
      cards: withBasics(deck.cards, plan.lands, () => crypto.randomUUID()),
    });
    return { added: plan.lands.length, reason: plan.reason };
  },
});
