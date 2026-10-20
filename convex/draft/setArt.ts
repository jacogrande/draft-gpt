import { v } from "convex/values";
import { internalMutation } from "../_generated/server";
import { isLive } from "../lobby/lifecycle";
import { canAccept } from "./set/state";

export const save = internalMutation({
  args: {
    jobId: v.id("setJobs"),
    key: v.string(),
    imageId: v.id("_storage"),
    prompt: v.string(),
    slotId: v.string(),
  },
  handler: async (ctx, { jobId, key, imageId, prompt, slotId }) => {
    const job = await ctx.db.get(jobId);
    const run = job && (await ctx.db.get(job.runId));
    const lobby = run && (await ctx.db.get(run.lobbyId));
    const design =
      run &&
      (await ctx.db
        .query("setDesigns")
        .withIndex("by_run_slot", (q) =>
          q.eq("runId", run._id).eq("slotId", slotId)
        )
        .unique());
    if (
      !job ||
      !run ||
      !design?.card ||
      design.imageId ||
      !canAccept(run, job, key, isLive(lobby) && lobby.setRunId === run._id)
    ) {
      await ctx.storage.delete(imageId);
      return;
    }
    const image_url = await ctx.storage.getUrl(imageId);
    await ctx.db.patch(design._id, {
      imageId,
      artPrompt: prompt,
      card: { ...design.card, image_url },
    });
  },
});
