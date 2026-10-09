import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { requirePlayer, viewAsPlayer } from "./access";

export const heartbeat = mutation({
  args: { gameId: v.id("games") },
  handler: async (ctx, { gameId }) => {
    const { userId } = await requirePlayer(ctx, gameId);
    const existing = await ctx.db
      .query("gamePresence")
      .withIndex("by_game_user", (q) =>
        q.eq("gameId", gameId).eq("userId", userId)
      )
      .unique();
    const lastSeenAt = Date.now();
    if (existing) await ctx.db.patch(existing._id, { lastSeenAt });
    else await ctx.db.insert("gamePresence", { gameId, userId, lastSeenAt });
  },
});

export const list = query({
  args: { gameId: v.id("games") },
  handler: async (ctx, { gameId }) => {
    if (!(await viewAsPlayer(ctx, gameId))) return [];
    const rows = await ctx.db
      .query("gamePresence")
      .withIndex("by_game", (q) => q.eq("gameId", gameId))
      .collect();
    return rows.map((row) => ({
      userId: row.userId,
      lastSeenAt: row.lastSeenAt,
    }));
  },
});
