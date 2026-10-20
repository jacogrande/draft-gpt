import { internal } from "../_generated/api";
import { Doc, Id } from "../_generated/dataModel";
import { MutationCtx } from "../_generated/server";
import { isLive, reportGenerationError } from "../lobby/lifecycle";
import { generationKey } from "./retry";
import { reserveAllowed } from "./set/state";
import { Task } from "./set/types";
import { taskReservation } from "./set/requestContext";

export const jobsFor = (ctx: MutationCtx, runId: Id<"setRuns">) =>
  ctx.db
    .query("setJobs")
    .withIndex("by_run", (q) => q.eq("runId", runId))
    .collect();
export const enqueue = async (
  ctx: MutationCtx,
  run: Doc<"setRuns">,
  task: Task
) => {
  await ctx.db.insert("setJobs", {
    runId: run._id,
    runKey: run.key,
    revision: run.revision,
    stage: task.stage,
    key: generationKey(),
    status: "queued",
    attempt: 1,
    repairs: 0,
    task: JSON.stringify(task),
    reservation: 0,
  });
};
export const pump = async (
  ctx: MutationCtx,
  runId: Id<"setRuns">
): Promise<void> => {
  const run = await ctx.db.get(runId);
  const lobby = run && (await ctx.db.get(run.lobbyId));
  if (
    !run ||
    !isLive(lobby) ||
    lobby.setRunId !== runId ||
    run.error ||
    run.phase === "ready"
  )
    return;
  const jobs = (await jobsFor(ctx, runId)).filter((j) => j.stage === run.phase);
  if (jobs.every((j) => j.status === "done")) {
    await ctx.scheduler.runAfter(0, internal.draft.setAdvance.advance, {
      runId,
      key: run.key,
      phase: run.phase,
    });
    return;
  }
  let reserved = run.reserved;
  const candidates = await ctx.db
    .query("setJobs")
    .withIndex("by_status", (q) => q.eq("status", "running"))
    .collect();
  const running = [];
  for (const candidate of candidates) {
    const owner = await ctx.db.get(candidate.runId);
    const room = owner && (await ctx.db.get(owner.lobbyId));
    if (owner && isLive(room) && room.setRunId === owner._id)
      running.push(candidate);
    else {
      await ctx.db.patch(candidate._id, {
        status: "cancelled",
        key: generationKey(),
        reservation: 0,
      });
      if (owner)
        await ctx.db.patch(owner._id, {
          spent: owner.spent + candidate.reservation,
          reserved: Math.max(0, owner.reserved - candidate.reservation),
        });
    }
  }
  const available = Math.max(
    0,
    Math.min(
      8 - running.length,
      4 - jobs.filter((j) => j.status === "running").length
    )
  );
  for (const job of jobs
    .filter((j) => j.status === "queued")
    .slice(0, available)) {
    const reservation = taskReservation(JSON.parse(job.task) as Task);
    if (!reserveAllowed(run.spent, reserved, reservation, run.budget)) {
      if (run.phase === "art") {
        await ctx.db.patch(job._id, { status: "done", result: "null" });
        await ctx.scheduler.runAfter(0, internal.draft.setJobs.wake, {
          runId,
          key: run.key,
        });
        continue;
      }
      await ctx.db.patch(runId, {
        error: "Generation budget reached. Successful work is saved.",
      });
      await reportGenerationError(
        ctx,
        run.lobbyId,
        "Generation budget reached. Successful work is saved."
      );
      break;
    }
    const key = generationKey();
    const jobId = await ctx.scheduler.runAfter(
      0,
      internal.draft.setWorker.execute,
      { jobId: job._id, key }
    );
    await ctx.scheduler.runAfter(5 * 60_000, internal.draft.setJobs.stalled, {
      jobId: job._id,
      key,
    });
    await ctx.db.patch(job._id, {
      key,
      status: "running",
      reservation,
      jobId,
      startedAt: Date.now(),
    });
    reserved += reservation;
  }
  if (reserved !== run.reserved) await ctx.db.patch(runId, { reserved });
};

export const wakeQueued = async (ctx: MutationCtx, except: Id<"setRuns">) => {
  const jobs = await ctx.db
    .query("setJobs")
    .withIndex("by_status", (q) => q.eq("status", "queued"))
    .take(100);
  for (const runId of new Set(jobs.map((j) => j.runId))) {
    const owner = await ctx.db.get(runId);
    const lobby = owner && (await ctx.db.get(owner.lobbyId));
    if (
      !owner ||
      !isLive(lobby) ||
      lobby.setRunId !== runId ||
      owner.phase === "ready"
    ) {
      for (const job of jobs.filter((j) => j.runId === runId))
        await ctx.db.patch(job._id, {
          status: "cancelled",
          key: generationKey(),
        });
    } else if (runId !== except && !owner.error) await schedulePump(ctx, runId);
  }
};

export const schedulePump = async (ctx: MutationCtx, runId: Id<"setRuns">) => {
  const run = await ctx.db.get(runId);
  if (!run || run.wakePending) return;
  await ctx.db.patch(runId, { wakePending: true });
  await ctx.scheduler.runAfter(500, internal.draft.setJobs.wake, {
    runId,
    key: run.key,
  });
};
