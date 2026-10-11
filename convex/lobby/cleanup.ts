import { internalMutation } from "../_generated/server";
import { isAbandoned, lastActivity } from "./roster";

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
        const sightings = await ctx.db
          .query("lobbyPresence")
          .withIndex("by_lobby", (q) => q.eq("lobbyId", lobby._id))
          .collect();
        const lastActiveAt = lastActivity(
          lobby._creationTime,
          sightings.map((sighting) => sighting.lastSeenAt)
        );
        if (isAbandoned({ status, lastActiveAt }, now)) {
          await ctx.db.patch(lobby._id, { status: "closed", closedAt: now });
        }
      }
    }
  },
});
