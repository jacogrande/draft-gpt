import { v } from "convex/values";
import { internal } from "../_generated/api";
import { internalMutation } from "../_generated/server";
import {
  attachSetting,
  isLive,
  reportGenerationError,
} from "../lobby/lifecycle";
import { planTasks } from "./set/planning";
import { Blueprint, Design, Review, Slot, Stage, Task } from "./set/types";
import { NEXT } from "./set/state";
import { inventoryProblems, duplicateIssues } from "./set/parsing";
import { enqueue, jobsFor, pump } from "./setQueue";
import { prepareManifests, publishRound } from "./setPacks";
import { settingFromBlueprint } from "./set/setting";

export const advance = internalMutation({
  args: { runId: v.id("setRuns"), key: v.string(), phase: v.string() },
  handler: async (ctx, { runId, key, phase }): Promise<void> => {
    const run = await ctx.db.get(runId);
    const lobby = run && (await ctx.db.get(run.lobbyId));
    if (
      !run ||
      !isLive(lobby) ||
      lobby.setRunId !== runId ||
      run.key !== key ||
      run.phase !== phase ||
      run.error
    )
      return;
    try {
      const jobs = await jobsFor(ctx, runId);
      const completed = jobs.filter((j) => j.stage === phase);
      if (completed.some((j) => j.status !== "done")) return;
      const records = await ctx.db
        .query("setDesigns")
        .withIndex("by_run", (q) => q.eq("runId", runId))
        .collect();
      const slots = records.map((d) => JSON.parse(d.slot) as Slot);
      const designs: Design[] = records.flatMap((d) =>
        d.card ? [{ slotId: d.slotId, face: d.card, tokens: d.tokens }] : []
      );
      let blueprint: Blueprint | undefined = run.blueprint
        ? JSON.parse(run.blueprint)
        : undefined;
      if (phase === "brief") {
        blueprint = JSON.parse(completed[0].result!) as Blueprint;
        await ctx.db.patch(runId, { blueprint: JSON.stringify(blueprint) });
        const settingId = await ctx.db.insert("settings", {
          lobbyId: run.lobbyId,
          ...settingFromBlueprint(blueprint),
        });
        await attachSetting(ctx, run.lobbyId, settingId);
      }
      if (phase === "slots") {
        for (const job of completed)
          for (const slot of JSON.parse(job.result!) as Slot[]) {
            await ctx.db.insert("setDesigns", {
              runId,
              slotId: slot.id,
              slot: JSON.stringify(slot),
              tokens: [],
              revision: 1,
            });
          }
      }
      if (phase === "art") {
        await ctx.db.patch(runId, { phase: "ready" });
        await publishRound(ctx, lobby, run, 1);
        return;
      }
      const reviews = jobs
        .filter((j) => j.stage === "review")
        .map((j) => JSON.parse(j.result!) as Review);
      const editPlan = jobs.find((j) => j.stage === "editPlan")?.result;
      const issues = editPlan
        ? (JSON.parse(editPlan) as Review).issues
        : [...reviews.flatMap((r) => r.issues), ...duplicateIssues(designs)];
      if (phase === "editPlan" || phase === "final") {
        const review = JSON.parse(completed[0].result!) as Review;
        const problems =
          phase === "final" ? inventoryProblems(slots, designs) : [];
        if (
          review.blueprintBroken ||
          (phase === "final" &&
            (problems.length ||
              review.issues.some((i) => i.severity !== "minor")))
        ) {
          const error = review.blueprintBroken
            ? "The setting needs a fresh design pass."
            : "The set still has unresolved design problems. Start a fresh candidate.";
          await ctx.db.patch(runId, { error, restartRequired: true });
          await reportGenerationError(ctx, run.lobbyId, error);
          return;
        }
      }
      const next = NEXT[phase as Stage]!;
      await ctx.db.patch(runId, { phase: next });
      const base: Task = {
        stage: next,
        total: run.total,
        ideas: run.ideas,
        blueprint,
      };
      const planned =
        phase === "slots"
          ? completed.flatMap((j) => JSON.parse(j.result!) as Slot[])
          : slots;
      let tasks = planTasks(base, planned, designs, issues);
      if (next === "art") {
        await ctx.db.patch(runId, {
          frozen: true,
          artDeadline: Date.now() + 90000,
        });
        const selected = await prepareManifests(ctx, run, lobby, records);
        tasks = selected.map((d) => ({
          ...base,
          designs: [{ slotId: d.slotId, face: d.card!, tokens: d.tokens }],
        }));
        await ctx.scheduler.runAfter(
          90000,
          internal.draft.setPacks.artDeadline,
          { runId, key }
        );
      }
      for (const task of tasks) await enqueue(ctx, run, task);
      await pump(ctx, runId);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Set planning failed";
      await ctx.db.patch(runId, { error: message, restartRequired: true });
      await reportGenerationError(ctx, run.lobbyId, message);
    }
  },
});
