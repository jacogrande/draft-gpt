import { v } from "convex/values";
import { internal } from "../_generated/api";
import { Id } from "../_generated/dataModel";
import {
  internalMutation,
  internalQuery,
  MutationCtx,
} from "../_generated/server";
import { isLive, reportGenerationError } from "../lobby/lifecycle";
import { generationKey, retryDelay } from "./retry";
import { canAccept } from "./set/state";
import { repairCards } from "./set/repair";
import { Design, Task, Usage } from "./set/types";
import { pump, schedulePump, wakeQueued } from "./setQueue";

const owned = async (ctx: MutationCtx, jobId: Id<"setJobs">, key: string) => {
  const job = await ctx.db.get(jobId);
  const run = job && (await ctx.db.get(job.runId));
  const lobby = run && (await ctx.db.get(run.lobbyId));
  return job &&
    run &&
    canAccept(run, job, key, isLive(lobby) && lobby.setRunId === run._id)
    ? { job, run }
    : null;
};
export const input = internalQuery({
  args: { jobId: v.id("setJobs"), key: v.string() },
  handler: async (ctx, { jobId, key }) => {
    const job = await ctx.db.get(jobId);
    const run = job && (await ctx.db.get(job.runId));
    const lobby = run && (await ctx.db.get(run.lobbyId));
    if (
      !job ||
      !run ||
      !canAccept(run, job, key, isLive(lobby) && lobby.setRunId === run._id)
    )
      return null;
    return { task: job.task, artDeadline: run.artDeadline };
  },
});

export const finish = internalMutation({
  args: {
    jobId: v.id("setJobs"),
    key: v.string(),
    result: v.string(),
    usage: v.string(),
    error: v.optional(v.string()),
  },
  handler: async (ctx, { jobId, key, result, usage, error }) => {
    const state = await owned(ctx, jobId, key);
    if (!state) return;
    const { job, run } = state;
    const task = JSON.parse(job.task) as Task;
    const metered = JSON.parse(usage) as Usage;
    await ctx.db.patch(run._id, {
      reserved: Math.max(0, run.reserved - job.reservation),
      spent: run.spent + metered.cost,
    });
    await ctx.db.patch(jobId, {
      usageHistory: [...(job.usageHistory ?? []), usage],
    });
    let repair = error;
    let nextTask = task;
    if (!error && ["generate", "revise"].includes(job.stage)) {
      const response = JSON.parse(result) as {
        cards: Design[];
        errors: string[];
      };
      for (const card of response.cards) {
        const design = await ctx.db
          .query("setDesigns")
          .withIndex("by_run_slot", (q) =>
            q.eq("runId", run._id).eq("slotId", card.slotId)
          )
          .unique();
        if (!design || run.frozen || (design.card && job.stage === "generate"))
          continue;
        await ctx.db.patch(design._id, {
          card: card.face,
          tokens: card.tokens,
          revision: job.stage === "revise" ? 2 : 1,
        });
      }
      if (response.errors.length) {
        nextTask = repairCards(task, response);
        repair = nextTask.feedback;
      }
    }
    if (repair) {
      const terminal = job.repairs >= 2;
      await ctx.db.patch(jobId, {
        status: terminal ? "failed" : "queued",
        key: generationKey(),
        repairs: job.repairs + 1,
        reservation: 0,
        task: JSON.stringify({ ...nextTask, feedback: repair }),
        error: repair,
        usage,
      });
      if (terminal) {
        const message =
          "A generation response could not be validated. Successful cards are saved.";
        await ctx.db.patch(run._id, { error: message, restartRequired: true });
        await reportGenerationError(ctx, run.lobbyId, message);
      }
    } else {
      await ctx.db.patch(jobId, {
        status: "done",
        reservation: 0,
        result,
        usage,
        finishedAt: Date.now(),
      });
    }
    await schedulePump(ctx, run._id);
    await ctx.scheduler.runAfter(500, internal.draft.setJobs.release, {
      runId: run._id,
      key: run.key,
    });
  },
});

const failJob = async (
  ctx: MutationCtx,
  jobId: Id<"setJobs">,
  key: string,
  message: string,
  retryAfterMs = 0
) => {
  const state = await owned(ctx, jobId, key);
  if (!state) return;
  const { job, run } = state;
  await ctx.db.patch(run._id, {
    spent: run.spent + job.reservation,
    reserved: Math.max(0, run.reserved - job.reservation),
  });
  const delay = retryDelay(job.attempt, retryAfterMs);
  const retryKey = generationKey();
  await ctx.db.patch(jobId, {
    key: retryKey,
    status: delay === null ? "failed" : "waiting",
    error: message,
    reservation: 0,
    attempt: job.attempt + 1,
    usageHistory: [
      ...(job.usageHistory ?? []),
      JSON.stringify({
        cost: job.reservation,
        requestId: "uncertain-failed-request",
      }),
    ],
  });
  if (delay === null) {
    await ctx.db.patch(run._id, { error: message });
    await reportGenerationError(ctx, run.lobbyId, message);
  } else
    await ctx.scheduler.runAfter(delay, internal.draft.setJobs.retry, {
      jobId,
      key: retryKey,
    });
  await schedulePump(ctx, run._id);
  await ctx.scheduler.runAfter(500, internal.draft.setJobs.release, {
    runId: run._id,
    key: run.key,
  });
};
export const failed = internalMutation({
  args: {
    jobId: v.id("setJobs"),
    key: v.string(),
    message: v.string(),
    retryAfterMs: v.optional(v.number()),
  },
  handler: (ctx, a) => failJob(ctx, a.jobId, a.key, a.message, a.retryAfterMs),
});
export const stalled = internalMutation({
  args: { jobId: v.id("setJobs"), key: v.string() },
  handler: (ctx, a) => failJob(ctx, a.jobId, a.key, "Generation timed out"),
});
export const retry = internalMutation({
  args: { jobId: v.id("setJobs"), key: v.string() },
  handler: async (ctx, { jobId, key }) => {
    const job = await ctx.db.get(jobId);
    if (job?.status !== "waiting" || job.key !== key) return;
    await ctx.db.patch(jobId, { status: "queued" });
    await pump(ctx, job.runId);
  },
});
export const wake = internalMutation({
  args: { runId: v.id("setRuns"), key: v.string() },
  handler: async (ctx, { runId, key }) => {
    const run = await ctx.db.get(runId);
    if (!run || run.key !== key) return;
    if (run.wakePending) await ctx.db.patch(runId, { wakePending: false });
    await pump(ctx, runId);
  },
});

export const release = internalMutation({
  args: { runId: v.id("setRuns"), key: v.string() },
  handler: async (ctx, { runId, key }) => {
    if ((await ctx.db.get(runId))?.key !== key) return;
    await wakeQueued(ctx, runId);
  },
});
