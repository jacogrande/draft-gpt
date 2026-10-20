import { v } from "convex/values";
import { Doc } from "../_generated/dataModel";
import { internalMutation, MutationCtx } from "../_generated/server";
import { markDrafting, markGenerating, isLive } from "../lobby/lifecycle";
import { watchParticipant } from "./absent";
import { packOrders } from "./seating";
import { collate } from "./set/collation";
import { roundPacks } from "./rounds";

export const prepareManifests = async (
  ctx: MutationCtx,
  run: Doc<"setRuns">,
  lobby: Doc<"lobbies">,
  designs: Doc<"setDesigns">[]
) => {
  const count = lobby.participantIds!.length;
  const packs = collate(
    designs.map((d) => ({ slotId: d.slotId, face: d.card!, tokens: d.tokens })),
    3 * count,
    run.seed
  );
  const selected = new Set<string>();
  for (const [index, ids] of packs.entries()) {
    const records = ids.map((id) => designs.find((d) => d.slotId === id)!);
    records.forEach((d) => selected.add(d.slotId));
    await ctx.db.insert("setManifests", {
      runId: run._id,
      round: Math.floor(index / count) + 1,
      seat: index % count,
      designs: records.map((d) => d._id),
      published: false,
    });
  }
  return designs.filter((d) => selected.has(d.slotId));
};

export const publishRound = async (
  ctx: MutationCtx,
  lobby: Doc<"lobbies">,
  run: Doc<"setRuns">,
  round: number
) => {
  const manifests = await ctx.db
    .query("setManifests")
    .withIndex("by_run_round", (q) => q.eq("runId", run._id).eq("round", round))
    .collect();
  if (!run.frozen || manifests.length !== lobby.participantIds!.length)
    throw new Error("Pack manifests are incomplete");
  if (manifests.every((m) => m.published)) return;
  await markGenerating(ctx, lobby._id, round);
  const orders = packOrders(lobby.participantIds!, round);
  for (const manifest of manifests) {
    if (manifest.published) continue;
    const order = orders[manifest.seat];
    const packId = await ctx.db.insert("packs", {
      lobbyId: lobby._id,
      round,
      order,
      position: 0,
      holderId: order[0],
      cardCount: 15,
      ready: true,
    });
    for (const id of manifest.designs) {
      const design = (await ctx.db.get(id))!;
      await ctx.db.insert("cards", {
        ...design.card!,
        designId: id,
        settingId: lobby.settingId!,
        lobbyId: lobby._id,
        packId,
        pickedBy: null,
      });
    }
    await ctx.db.patch(manifest._id, { published: true });
  }
  const packs = await roundPacks(ctx, lobby._id, round);
  if (packs.length !== manifests.length)
    throw new Error("Unexpected pack count");
  await markDrafting(ctx, lobby._id);
  for (const userId of lobby.participantIds!)
    await watchParticipant(ctx, lobby, userId, 0);
};
export const artDeadline = internalMutation({
  args: { runId: v.id("setRuns"), key: v.string() },
  handler: async (ctx, { runId, key }) => {
    const run = await ctx.db.get(runId);
    const lobby = run && (await ctx.db.get(run.lobbyId));
    if (
      !run ||
      !isLive(lobby) ||
      lobby.setRunId !== runId ||
      run.key !== key ||
      run.phase !== "art"
    )
      return;
    const jobs = await ctx.db
      .query("setJobs")
      .withIndex("by_run", (q) => q.eq("runId", runId))
      .collect();
    for (const job of jobs)
      if (job.stage === "art" && job.status === "queued")
        await ctx.db.patch(job._id, { status: "done", result: "null" });
    await ctx.db.patch(runId, { phase: "ready" });
    await publishRound(ctx, lobby, run, 1);
  },
});
