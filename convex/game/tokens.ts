import { v } from "convex/values";
import { Id } from "../_generated/dataModel";
import { mutation, MutationCtx } from "../_generated/server";
import { reject } from "../errors";
import { requireViewer } from "../identity/viewer";
import { requireSide } from "./access";
import { parseTokenName } from "./extras";
import { record } from "./log";

const stat = v.union(v.number(), v.null());

const requireOwnToken = async (ctx: MutationCtx, tokenId: Id<"gameTokens">) => {
  const userId = await requireViewer(ctx);
  const token = await ctx.db.get(tokenId);
  if (!token || token.ownerId !== userId) return reject("PIECE_NOT_FOUND");
  return token;
};

export const create = mutation({
  args: { gameId: v.id("games"), name: v.string(), power: stat, toughness: stat },
  handler: async (ctx, { gameId, power, toughness, ...args }) => {
    const { userId } = await requireSide(ctx, gameId);
    const name = parseTokenName(args.name) ?? reject("INVALID_TOKEN");
    await ctx.db.insert("gameTokens", {
      gameId,
      ownerId: userId,
      name,
      power,
      toughness,
      tapped: false,
    });
    await record(ctx, gameId, userId, [`created a ${name} token`]);
  },
});

export const setTapped = mutation({
  args: { tokenId: v.id("gameTokens"), tapped: v.boolean() },
  handler: async (ctx, { tokenId, tapped }) => {
    const token = await requireOwnToken(ctx, tokenId);
    await ctx.db.patch(tokenId, { tapped });
    await record(ctx, token.gameId, token.ownerId, [
      `${tapped ? "tapped" : "untapped"} ${token.name} token`,
    ]);
  },
});

export const remove = mutation({
  args: { tokenId: v.id("gameTokens") },
  handler: async (ctx, { tokenId }) => {
    const token = await requireOwnToken(ctx, tokenId);
    await ctx.db.delete(tokenId);
    await record(ctx, token.gameId, token.ownerId, [
      `removed a ${token.name} token`,
    ]);
  },
});
