import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { Blueprint, Review, Slot } from "../../convex/draft/set/types";
import { Caller } from "../batch-eval/calls";
import { generateCandidate } from "../batch-eval/generate";
import { validated } from "../creativity-eval/run";
import { Arm, Block, ideas, sampleSlots, scope, BASELINE_SLOTS } from "./protocol";

export const generateWorld = async (out: string, arm: Arm, block: Block, caller: Caller) => {
  const id = `${arm.id}-repeat${block.repeat}`;
  const file = join(out, `${id}.json`);
  const saved = await readFile(file, "utf8").catch(() => null);
  if (saved) return JSON.parse(saved) as WorldSample;
  const call: Caller = (key, task, options = {}) => caller(key, task, {
    ...options,
    ...(task.stage === "slots" && !arm.jobs
      ? { stageInstructionsOverride: BASELINE_SLOTS } : {}),
  });
  const base = { total: 135, ideas };
  const blueprint = await validated<Blueprint>(`${id}-brief`, {
    ...base, stage: "brief",
    ...(arm.seed ? { creativeSeed: block.creativeSeed } : {}),
  }, call);
  const slots = await validated<Slot[]>(`${id}-slots`, {
    ...base, stage: "slots", blueprint, slots: sampleSlots,
  }, call);
  const candidate = await generateCandidate(id, { ...base, stage: "generate", blueprint, slots }, 15, call);
  const sample = { ...candidate, arm, repeat: block.repeat, blueprint, slots };
  await writeFile(file, JSON.stringify(sample, null, 2));
  console.log(`${id}: ${sample.designs.length}/15 cards; ${sample.inventoryProblems.join("; ") || "structure complete"}`);
  return sample;
};
export type WorldSample = Awaited<ReturnType<typeof generateCandidate>> & {
  arm: Arm; repeat: number; blueprint: Blueprint; slots: Slot[];
};
export const reviewWorld = async (sample: WorldSample, call: Caller) => ({
  candidateId: sample.id,
  review: await validated<Review>(`${sample.id}-review`, {
    stage: "review", total: 135, ideas, blueprint: sample.blueprint,
    slots: sample.slots, designs: sample.designs, scope,
  }, call),
});
