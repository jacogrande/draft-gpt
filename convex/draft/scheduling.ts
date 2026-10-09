import { internal } from "../_generated/api";
import { Id } from "../_generated/dataModel";
import { MutationCtx } from "../_generated/server";

const ACTION_LIMIT_MS = 10 * 60_000;
export const STALLED_AFTER_MS = ACTION_LIMIT_MS + 60_000;

export const scheduleGeneration = async (
  ctx: MutationCtx,
  delay: number,
  lobbyId: Id<"lobbies">,
  packId: Id<"packs"> | undefined,
  attempt: number
) => {
  const jobId = packId
    ? await ctx.scheduler.runAfter(
        delay,
        internal.draft.generation.createPack,
        { lobbyId, packId, attempt }
      )
    : await ctx.scheduler.runAfter(
        delay,
        internal.draft.generation.createSetting,
        { lobbyId, attempt }
      );
  if (packId) await ctx.db.patch(packId, { jobId });
  else await ctx.db.patch(lobbyId, { settingJobId: jobId });
  await ctx.scheduler.runAfter(
    delay + STALLED_AFTER_MS,
    internal.draft.failures.stalled,
    { lobbyId, packId, attempt, jobId }
  );
};
