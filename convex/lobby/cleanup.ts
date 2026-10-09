import { internalMutation } from "../_generated/server";
import { isAbandoned } from "./roster";

const LIVE_STATUSES = ["open", "generating", "drafting"] as const;

export const closeAbandoned = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    for (const status of LIVE_STATUSES) {
      const lobbies = await ctx.db
        .query("lobbies")
        .withIndex("by_status", (q) => q.eq("status", status))
        .collect();
      for (const lobby of lobbies) {
        const abandoned = isAbandoned(
          { status, createdAt: lobby._creationTime },
          now
        );
        if (abandoned) {
          await ctx.db.patch(lobby._id, { status: "closed", closedAt: now });
        }
      }
    }
  },
});
