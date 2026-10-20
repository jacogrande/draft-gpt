import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { reject } from "../errors";
import { loadMembers, requireMember } from "../lobby/access";
import { beginDraft } from "../lobby/lifecycle";
import { bySeat, startBlocker } from "../lobby/roster";
import { beginSet } from "./setRuns";
import { scheduleGeneration } from "./scheduling";

export const startDraft = mutation({
  args: { lobbyId: v.id("lobbies") },
  handler: async (ctx, { lobbyId }) => {
    const { lobby } = await requireMember(ctx, lobbyId);
    if (lobby.status !== "open") reject("LOBBY_NOT_OPEN");
    const members = await loadMembers(ctx, lobbyId);
    const blocker = startBlocker(members);
    if (blocker) reject(blocker);
    await beginDraft(
      ctx,
      lobbyId,
      bySeat(members).map((member) => member.userId)
    );
    if (process.env.SET_GENERATION_ENABLED === "false" && lobby.powerLevel !== "busted")
      await scheduleGeneration(ctx, 0, lobbyId, undefined, 1);
    else await beginSet(ctx, lobby, members.length);
  },
});
