import { internalMutation } from "../_generated/server";
import { isAbandoned } from "./seats";

const LIVE_STATUSES = ["open", "playing"] as const;

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
        if (isAbandoned({ status, createdAt: game._creationTime }, now)) {
          await ctx.db.patch(game._id, { status: "closed", closedAt: now });
        }
      }
    }
  },
});
