import { internal } from "../_generated/api";
import { Id } from "../_generated/dataModel";
import { MutationCtx } from "../_generated/server";
import { trackSettingJob } from "../lobby/lifecycle";
import { generationKey } from "./retry";

const ACTION_LIMIT_MS = 10 * 60_000;
export const STALLED_AFTER_MS = ACTION_LIMIT_MS + 60_000;

export const scheduleGeneration = async (
  ctx: MutationCtx,
  delay: number,
  lobbyId: Id<"lobbies">,
  packId: Id<"packs"> | undefined,
  attempt: number
) => {
  const key = generationKey();
  const jobId = packId
    ? await ctx.scheduler.runAfter(
        delay,
        internal.draft.generation.createPack,
        { lobbyId, packId, attempt, key }
      )
    : await ctx.scheduler.runAfter(
        delay,
        internal.draft.generation.createSetting,
        { lobbyId, attempt, key }
      );
  if (packId) await ctx.db.patch(packId, { jobId, jobKey: key });
  else await trackSettingJob(ctx, lobbyId, jobId, key);
  await ctx.scheduler.runAfter(
    delay + STALLED_AFTER_MS,
    internal.draft.failures.stalled,
    { lobbyId, packId, attempt, key }
  );
};

export const isRunning = async (
  ctx: MutationCtx,
  jobId: Id<"_scheduled_functions"> | undefined
) => {
  if (!jobId) return false;
  const job = await ctx.db.system.get(jobId);
  return job?.state.kind === "pending" || job?.state.kind === "inProgress";
};
