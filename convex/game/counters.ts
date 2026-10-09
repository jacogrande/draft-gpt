import { v } from "convex/values";
import { Id } from "../_generated/dataModel";
import { mutation, MutationCtx } from "../_generated/server";
import { reject } from "../errors";
import { requireViewer } from "../identity/viewer";
import { requireSide } from "./access";
import { COUNTER_COLORS, parseCounterValue } from "./extras";

const position = v.object({ x: v.number(), y: v.number() });

const requireOwnCounter = async (
  ctx: MutationCtx,
  counterId: Id<"gameCounters">
) => {
  const userId = await requireViewer(ctx);
  const counter = await ctx.db.get(counterId);
  if (!counter || counter.ownerId !== userId) return reject("PIECE_NOT_FOUND");
  return counter;
};

export const create = mutation({
  args: { gameId: v.id("games"), position },
  handler: async (ctx, { gameId, position }) => {
    const { userId } = await requireSide(ctx, gameId);
    const color =
      COUNTER_COLORS[Math.floor(Math.random() * COUNTER_COLORS.length)];
    await ctx.db.insert("gameCounters", {
      gameId,
      ownerId: userId,
      value: "0",
      color,
      position,
    });
  },
});

export const setValue = mutation({
  args: { counterId: v.id("gameCounters"), value: v.string() },
  handler: async (ctx, { counterId, value }) => {
    await requireOwnCounter(ctx, counterId);
    await ctx.db.patch(counterId, {
      value: parseCounterValue(value) ?? reject("INVALID_COUNTER"),
    });
  },
});

export const move = mutation({
  args: { counterId: v.id("gameCounters"), position },
  handler: async (ctx, { counterId, position }) => {
    await requireOwnCounter(ctx, counterId);
    await ctx.db.patch(counterId, { position });
  },
});

export const remove = mutation({
  args: { counterId: v.id("gameCounters") },
  handler: async (ctx, { counterId }) => {
    await requireOwnCounter(ctx, counterId);
    await ctx.db.delete(counterId);
  },
});
