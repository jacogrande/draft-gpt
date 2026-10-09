import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { reject } from "../errors";
import { loadMembers, requireMember } from "../lobby/access";
import { bySeat, startBlocker } from "../lobby/roster";
import { scheduleGeneration } from "./scheduling";

export const startDraft = mutation({
  args: { lobbyId: v.id("lobbies") },
  handler: async (ctx, { lobbyId }) => {
    const { lobby } = await requireMember(ctx, lobbyId);
    if (lobby.status !== "open") reject("LOBBY_NOT_OPEN");
    const members = await loadMembers(ctx, lobbyId);
    const blocker = startBlocker(members);
    if (blocker) reject(blocker);
    await ctx.db.patch(lobbyId, {
      status: "generating",
      participantIds: bySeat(members).map((member) => member.userId),
    });
    await scheduleGeneration(ctx, 0, lobbyId, undefined, 1);
  },
});
