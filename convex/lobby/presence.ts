import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { noteReturn } from "../draft/returning";
import { requireMember, viewAsMember } from "./access";
import { findSighting } from "./sightings";

export const heartbeat = mutation({
  args: { lobbyId: v.id("lobbies") },
  handler: async (ctx, { lobbyId }) => {
    const { userId, lobby } = await requireMember(ctx, lobbyId);
    const existing = await findSighting(ctx, lobbyId, userId);
    const lastSeenAt = Date.now();
    if (existing) await ctx.db.patch(existing._id, { lastSeenAt });
    else await ctx.db.insert("lobbyPresence", { lobbyId, userId, lastSeenAt });
    await noteReturn(ctx, lobby, userId);
  },
});

export const list = query({
  args: { lobbyId: v.id("lobbies") },
  handler: async (ctx, { lobbyId }) => {
    if (!(await viewAsMember(ctx, lobbyId))) return [];
    const rows = await ctx.db
      .query("lobbyPresence")
      .withIndex("by_lobby", (q) => q.eq("lobbyId", lobbyId))
      .collect();
    return rows.map((row) => ({
      userId: row.userId,
      lastSeenAt: row.lastSeenAt,
    }));
  },
});
