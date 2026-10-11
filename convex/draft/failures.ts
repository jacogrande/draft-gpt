import { v } from "convex/values";
import { Doc, Id } from "../_generated/dataModel";
import { internalMutation, mutation, MutationCtx } from "../_generated/server";
import { reject } from "../errors";
import { requireHost } from "../lobby/access";
import { isLive, reportGenerationError } from "../lobby/lifecycle";
import { retryDelay } from "./retry";
import { PACK_STAGGER_MS, roundPacks } from "./rounds";
import { isRunning, scheduleGeneration } from "./scheduling";

const step = {
  lobbyId: v.id("lobbies"),
  packId: v.optional(v.id("packs")),
  attempt: v.number(),
  key: v.string(),
};

const ownedStep = async (
  ctx: MutationCtx,
  lobbyId: Id<"lobbies">,
  packId: Id<"packs"> | undefined,
  key: string
): Promise<Doc<"lobbies"> | null> => {
  const lobby = await ctx.db.get(lobbyId);
  if (!isLive(lobby)) return null;
  if (!packId) return lobby.settingId || lobby.settingKey !== key ? null : lobby;
  const pack = await ctx.db.get(packId);
  return !pack || pack.ready || pack.jobKey !== key ? null : lobby;
};

const retryOrReport = async (
  ctx: MutationCtx,
  lobby: Doc<"lobbies">,
  packId: Id<"packs"> | undefined,
  attempt: number,
  message: string,
  retryAfterMs?: number
) => {
  const delay = retryDelay(attempt, retryAfterMs);
  if (delay === null) {
    if (!lobby.generationError) {
      await reportGenerationError(ctx, lobby._id, message);
    }
    return;
  }
  await scheduleGeneration(ctx, delay, lobby._id, packId, attempt + 1);
};

export const record = internalMutation({
  args: { ...step, message: v.string(), retryAfterMs: v.optional(v.number()) },
  handler: async (ctx, { lobbyId, packId, attempt, key, message, retryAfterMs }) => {
    const lobby = await ownedStep(ctx, lobbyId, packId, key);
    if (!lobby) return;
    await retryOrReport(ctx, lobby, packId, attempt, message, retryAfterMs);
  },
});

export const stalled = internalMutation({
  args: step,
  handler: async (ctx, { lobbyId, packId, attempt, key }) => {
    const lobby = await ownedStep(ctx, lobbyId, packId, key);
    if (!lobby) return;
    await retryOrReport(ctx, lobby, packId, attempt, "Generation timed out");
  },
});

export const retryGeneration = mutation({
  args: { lobbyId: v.id("lobbies") },
  handler: async (ctx, { lobbyId }) => {
    const { lobby } = await requireHost(ctx, lobbyId);
    if (lobby.status !== "generating" || !lobby.generationError)
      reject("NOTHING_TO_RETRY");
    await reportGenerationError(ctx, lobbyId, undefined);
    if (!lobby.settingId) {
      await scheduleGeneration(ctx, 0, lobbyId, undefined, 1);
      return;
    }
    let scheduled = 0;
    for (const pack of await roundPacks(ctx, lobbyId, lobby.round)) {
      if (pack.ready || (await isRunning(ctx, pack.jobId))) continue;
      const delay = scheduled++ * PACK_STAGGER_MS;
      await scheduleGeneration(ctx, delay, lobbyId, pack._id, 1);
    }
  },
});
