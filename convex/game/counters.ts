import { v } from "convex/values";
import { Id } from "../_generated/dataModel";
import { mutation, MutationCtx } from "../_generated/server";
import { reject } from "../errors";
import { requireSide } from "./access";
import { COUNTER_COLORS, parseCounterValue } from "./extras";
import { record } from "./log";

const position = v.object({ x: v.number(), y: v.number() });

const requireOwnCounter = async (
  ctx: MutationCtx,
  counterId: Id<"gameCounters">
) => {
  const counter = (await ctx.db.get(counterId)) ?? reject("PIECE_NOT_FOUND");
  const { userId } = await requireSide(ctx, counter.gameId);
  if (counter.ownerId !== userId) return reject("PIECE_NOT_FOUND");
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
    await record(ctx, gameId, userId, ["created a counter"]);
  },
});

export const setValue = mutation({
  args: { counterId: v.id("gameCounters"), value: v.string() },
  handler: async (ctx, { counterId, value }) => {
    const counter = await requireOwnCounter(ctx, counterId);
    const next = parseCounterValue(value) ?? reject("INVALID_COUNTER");
    await ctx.db.patch(counterId, { value: next });
    await record(ctx, counter.gameId, counter.ownerId, [
      `set a counter to ${next}`,
    ]);
  },
});

export const move = mutation({
  args: { counterId: v.id("gameCounters"), position },
  handler: async (ctx, { counterId, position }) => {
    const counter = await requireOwnCounter(ctx, counterId);
    await ctx.db.patch(counterId, { position });
    await record(ctx, counter.gameId, counter.ownerId, ["moved a counter"]);
  },
});

export const remove = mutation({
  args: { counterId: v.id("gameCounters") },
  handler: async (ctx, { counterId }) => {
    const counter = await requireOwnCounter(ctx, counterId);
    await ctx.db.delete(counterId);
    await record(ctx, counter.gameId, counter.ownerId, ["removed a counter"]);
  },
});
