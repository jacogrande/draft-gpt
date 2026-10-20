import { v } from "convex/values";
import { Doc, Id } from "../_generated/dataModel";
import { MutationCtx, query } from "../_generated/server";
import { viewAsMember } from "../lobby/access";
import { listIdeas } from "../lobby/ideas";
import { attachSetRun, reportGenerationError } from "../lobby/lifecycle";
import { generationKey } from "./retry";
import { powerLevelOf } from "../powerLevel";
import { worldDirection, WorldDirection } from "./set/worldDirection";
import { stageLabel } from "./set/state";
import { VERSIONS } from "./set/types";
import { enqueue, jobsFor, pump } from "./setQueue";

export const beginSet = async (
  ctx: MutationCtx,
  lobby: Doc<"lobbies">,
  count: number
): Promise<Id<"setRuns">> => {
  const ideas = await listIdeas(ctx, lobby._id);
  const total = count <= 4 ? 135 : 270;
  const seed = Math.floor(Math.random() * 2 ** 32);
  const recent = await ctx.db.query("setRuns").order("desc").take(12);
  const direction = worldDirection(seed, recent.flatMap((run) =>
    run.worldDirection ? [JSON.parse(run.worldDirection) as WorldDirection] : []));
  const runId = await ctx.db.insert("setRuns", {
    lobbyId: lobby._id,
    key: generationKey(),
    revision: 1,
    total,
    powerLevel: powerLevelOf(lobby.powerLevel),
    phase: "brief",
    ideas,
    versions: JSON.stringify(VERSIONS),
    seed,
    worldDirection: JSON.stringify(direction),
    spent: 0,
    reserved: 0,
    budget: total === 135 ? 5 : 7,
  });
  await attachSetRun(ctx, lobby._id, runId);
  const run = (await ctx.db.get(runId))!;
  await enqueue(ctx, run, {
    stage: "brief",
    ideas,
    total,
    powerLevel: powerLevelOf(lobby.powerLevel),
    worldDirection: direction,
  });
  await pump(ctx, runId);
  return runId;
};
export const resumeSet = async (
  ctx: MutationCtx,
  lobby: Doc<"lobbies">
): Promise<void> => {
  const run = lobby.setRunId && (await ctx.db.get(lobby.setRunId));
  if (!run) return;
  if (run.restartRequired) {
    await beginSet(ctx, lobby, lobby.participantIds?.length ?? 2);
    return;
  }
  await ctx.db.patch(run._id, { error: undefined });
  await reportGenerationError(ctx, lobby._id, undefined);
  for (const job of await jobsFor(ctx, run._id)) {
    if (job.status === "failed")
      await ctx.db.patch(job._id, {
        status: "queued",
        attempt: 1,
        key: generationKey(),
        error: undefined,
      });
  }
  await pump(ctx, run._id);
};
export const progress = query({
  args: { lobbyId: v.id("lobbies") },
  handler: async (ctx, { lobbyId }) => {
    const view = await viewAsMember(ctx, lobbyId);
    const run = view?.lobby.setRunId && (await ctx.db.get(view.lobby.setRunId));
    if (!run) return null;
    const designs = await ctx.db
      .query("setDesigns")
      .withIndex("by_run", (q) => q.eq("runId", run._id))
      .collect();
    return {
      phase: run.phase,
      label: stageLabel(run.phase),
      total: run.total,
      completed: designs.filter((d) => d.card).length,
      restartRequired: !!run.restartRequired,
    };
  },
});
