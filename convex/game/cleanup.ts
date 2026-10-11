import { Doc } from "../_generated/dataModel";
import { internalMutation, MutationCtx } from "../_generated/server";
import { isAbandoned, isPurgeable } from "./seats";

const LIVE_STATUSES = ["open", "playing"] as const;
const OWNED_TABLES = [
  "gamePlayers",
  "gameLog",
  "gameTokens",
  "gameCounters",
  "gamePresence",
] as const;

const lastActiveAt = async (ctx: MutationCtx, game: Doc<"games">) => {
  const sightings = await ctx.db
    .query("gamePresence")
    .withIndex("by_game", (q) => q.eq("gameId", game._id))
    .collect();
  return Math.max(game._creationTime, ...sightings.map((s) => s.lastSeenAt));
};

export const closeAbandoned = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    for (const status of LIVE_STATUSES) {
      const games = await ctx.db
        .query("games")
        .withIndex("by_status", (q) => q.eq("status", status))
        .collect();
      for (const game of games) {
        const activity = { status, lastActiveAt: await lastActiveAt(ctx, game) };
        if (isAbandoned(activity, now)) {
          await ctx.db.patch(game._id, { status: "closed", closedAt: now });
        }
      }
    }
  },
});

export const purgeClosed = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const closed = await ctx.db
      .query("games")
      .withIndex("by_status", (q) => q.eq("status", "closed"))
      .collect();
    for (const game of closed) {
      const closedAt = game.closedAt ?? game._creationTime;
      if (!isPurgeable({ status: game.status, closedAt }, now)) continue;
      for (const table of OWNED_TABLES) {
        const rows = await ctx.db
          .query(table)
          .withIndex("by_game", (q) => q.eq("gameId", game._id))
          .collect();
        for (const row of rows) await ctx.db.delete(row._id);
      }
      await ctx.db.delete(game._id);
    }
  },
});
