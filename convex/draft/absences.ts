import { v } from "convex/values";
import { internal } from "../_generated/api";
import { Id } from "../_generated/dataModel";
import {
  internalMutation,
  mutation,
  MutationCtx,
  query,
} from "../_generated/server";
import { reject } from "../errors";
import { requireHost, viewAsMember } from "../lobby/access";
import { awayAt } from "../lobby/away";
import { findSighting } from "../lobby/sightings";
import {
  pauseCountdown,
  RECONNECT_WINDOW_MS,
  resumeCountdown,
  skipCountdown,
  startCountdown,
} from "./absence";
import { findAbsence, loadAbsences, watchParticipant } from "./absent";
import { runAutopilot } from "./autopilot";

const target = { lobbyId: v.id("lobbies"), userId: v.id("users") };

const absenceForHost = async (
  ctx: MutationCtx,
  lobbyId: Id<"lobbies">,
  userId: Id<"users">
) => {
  await requireHost(ctx, lobbyId);
  return (await findAbsence(ctx, lobbyId, userId)) ?? reject("NOT_AWAY");
};

const autopilotAfter = (
  ctx: MutationCtx,
  delay: number,
  lobbyId: Id<"lobbies">
) =>
  ctx.scheduler.runAfter(delay, internal.draft.absences.autopilot, { lobbyId });

export const list = query({
  args: { lobbyId: v.id("lobbies") },
  handler: async (ctx, { lobbyId }) => {
    if (!(await viewAsMember(ctx, lobbyId))) return [];
    const absences = await loadAbsences(ctx, lobbyId);
    return absences.map((absence) => ({
      userId: absence.userId,
      deadline: absence.deadline,
      remainingMs: absence.remainingMs,
    }));
  },
});

export const pause = mutation({
  args: target,
  handler: async (ctx, { lobbyId, userId }) => {
    const absence = await absenceForHost(ctx, lobbyId, userId);
    const paused =
      pauseCountdown(absence, Date.now()) ?? reject("TIMER_NOT_RUNNING");
    await ctx.db.patch(absence._id, paused);
  },
});

export const resume = mutation({
  args: target,
  handler: async (ctx, { lobbyId, userId }) => {
    const absence = await absenceForHost(ctx, lobbyId, userId);
    const now = Date.now();
    const resumed = resumeCountdown(absence, now) ?? reject("TIMER_NOT_PAUSED");
    await ctx.db.patch(absence._id, resumed);
    await autopilotAfter(ctx, (resumed.deadline ?? now) - now, lobbyId);
  },
});

export const skip = mutation({
  args: target,
  handler: async (ctx, { lobbyId, userId }) => {
    const absence = await absenceForHost(ctx, lobbyId, userId);
    await ctx.db.patch(absence._id, skipCountdown(Date.now()));
    await runAutopilot(ctx, lobbyId);
  },
});

export const watch = internalMutation({
  args: { ...target, round: v.number() },
  handler: async (ctx, { lobbyId, userId, round }) => {
    const lobby = await ctx.db.get(lobbyId);
    if (lobby?.status !== "drafting" || lobby.round !== round) return;
    if (await findAbsence(ctx, lobbyId, userId)) {
      await runAutopilot(ctx, lobbyId);
      return;
    }
    const sighting = await findSighting(ctx, lobbyId, userId);
    const now = Date.now();
    const leavesAt = awayAt(sighting?.lastSeenAt ?? null);
    if (leavesAt > now) {
      await watchParticipant(ctx, lobby, userId, leavesAt - now);
      return;
    }
    await ctx.db.insert("absences", { lobbyId, userId, ...startCountdown(now) });
    await autopilotAfter(ctx, RECONNECT_WINDOW_MS, lobbyId);
  },
});

export const autopilot = internalMutation({
  args: { lobbyId: v.id("lobbies") },
  handler: (ctx, { lobbyId }) => runAutopilot(ctx, lobbyId),
});
