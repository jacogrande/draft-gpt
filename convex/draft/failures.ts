import { v } from "convex/values";
import { Id } from "../_generated/dataModel";
import { internalMutation, mutation, MutationCtx } from "../_generated/server";
import { reject } from "../errors";
import { requireHost } from "../lobby/access";
import { retryDelay } from "./retry";
import { roundPacks } from "./rounds";
import { scheduleGeneration } from "./scheduling";

const step = {
  lobbyId: v.id("lobbies"),
  packId: v.optional(v.id("packs")),
  attempt: v.number(),
};

const retryOrReport = async (
  ctx: MutationCtx,
  lobbyId: Id<"lobbies">,
  packId: Id<"packs"> | undefined,
  attempt: number,
  message: string
) => {
  const delay = retryDelay(attempt);
  if (delay === null) {
    await ctx.db.patch(lobbyId, { generationError: message });
    return;
  }
  await scheduleGeneration(ctx, delay, lobbyId, packId, attempt + 1);
};

export const record = internalMutation({
  args: { ...step, message: v.string() },
  handler: (ctx, { lobbyId, packId, attempt, message }) =>
    retryOrReport(ctx, lobbyId, packId, attempt, message),
});

export const stalled = internalMutation({
  args: { ...step, jobId: v.id("_scheduled_functions") },
  handler: async (ctx, { lobbyId, packId, attempt, jobId }) => {
    const lobby = await ctx.db.get(lobbyId);
    const pack = packId && (await ctx.db.get(packId));
    const latestJobId = packId ? pack?.jobId : lobby?.settingJobId;
    const finished = packId ? pack?.ready : Boolean(lobby?.settingId);
    if (finished || latestJobId !== jobId) return;
    await retryOrReport(ctx, lobbyId, packId, attempt, "Generation timed out");
  },
});

export const retryGeneration = mutation({
  args: { lobbyId: v.id("lobbies") },
  handler: async (ctx, { lobbyId }) => {
    const { lobby } = await requireHost(ctx, lobbyId);
    if (lobby.status !== "generating" || !lobby.generationError)
      reject("NOTHING_TO_RETRY");
    await ctx.db.patch(lobbyId, { generationError: undefined });
    if (!lobby.settingId) {
      await scheduleGeneration(ctx, 0, lobbyId, undefined, 1);
      return;
    }
    const packs = await roundPacks(ctx, lobbyId, lobby.round);
    for (const pack of packs.filter((dealt) => !dealt.ready)) {
      await scheduleGeneration(ctx, 0, lobbyId, pack._id, 1);
    }
  },
});
