import { v } from "convex/values";
import { internal } from "../_generated/api";
import { Id } from "../_generated/dataModel";
import { internalMutation, mutation, MutationCtx } from "../_generated/server";
import { reject } from "../errors";
import { requireHost } from "../lobby/access";
import { retryDelay } from "./retry";
import { roundPacks } from "./rounds";

const schedule = (
  ctx: MutationCtx,
  delay: number,
  lobbyId: Id<"lobbies">,
  packId: Id<"packs"> | undefined,
  attempt: number
) =>
  packId
    ? ctx.scheduler.runAfter(delay, internal.draft.generation.createPack, {
        lobbyId,
        packId,
        attempt,
      })
    : ctx.scheduler.runAfter(delay, internal.draft.generation.createSetting, {
        lobbyId,
        attempt,
      });

export const record = internalMutation({
  args: {
    lobbyId: v.id("lobbies"),
    packId: v.optional(v.id("packs")),
    attempt: v.number(),
    message: v.string(),
  },
  handler: async (ctx, { lobbyId, packId, attempt, message }) => {
    const delay = retryDelay(attempt);
    if (delay === null) {
      await ctx.db.patch(lobbyId, { generationError: message });
      return;
    }
    await schedule(ctx, delay, lobbyId, packId, attempt + 1);
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
      await schedule(ctx, 0, lobbyId, undefined, 1);
      return;
    }
    const packs = await roundPacks(ctx, lobbyId, lobby.round);
    for (const pack of packs.filter((dealt) => !dealt.ready)) {
      await schedule(ctx, 0, lobbyId, pack._id, 1);
    }
  },
});
