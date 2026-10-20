import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { Blueprint, Review, Slot, Task } from "../../convex/draft/set/types";
import { inventoryProblems } from "../../convex/draft/set/parsing";
import { Caller, backoff } from "../batch-eval/calls";
import { generateCandidate, Candidate } from "../batch-eval/generate";
import { Arm, Block, ideas, sampleSlots, scope, suffix } from "./protocol";

export type Sample = Candidate & {
  arm: Arm;
  repeat: number;
  blueprint: Blueprint;
  slots: Slot[];
};
export const validated = async <T>(id: string, base: Task, call: Caller): Promise<T> => {
  let task = base;
  for (let attempt = 0; attempt < 3; attempt++) {
    const record = await call(`${id}-try${attempt}`, task);
    if (record.result?.data && !record.result.error) return record.result.data as T;
    if (record.result?.error) task = { ...base, feedback: record.result.error };
    if (attempt < 2) await backoff(record, attempt);
  }
  throw new Error(`Could not validate ${id}; saved failures retained`);
};
export const generateSample = async (out: string, arm: Arm, block: Block, caller: Caller): Promise<Sample> => {
  const id = `${arm.id}-repeat${block.repeat}`;
  const file = join(out, `${id}.json`);
  const saved = await readFile(file, "utf8").catch(() => null);
  if (saved) return JSON.parse(saved);
  const call: Caller = (key, task, options = {}) => caller(key, task, {
    ...options, instructionsSuffix: suffix(arm, block, task.stage),
  });
  const base = { total: 135, ideas };
  const blueprint = await validated<Blueprint>(`${id}-brief`, { ...base, stage: "brief" }, call);
  const slots = await validated<Slot[]>(`${id}-slots`, { ...base, stage: "slots", blueprint, slots: sampleSlots }, call);
  const candidate = await generateCandidate(id, { ...base, stage: "generate", blueprint, slots }, 15, call);
  const sample = { ...candidate, arm, repeat: block.repeat, blueprint, slots };
  await writeFile(file, JSON.stringify(sample, null, 2));
  console.log(`${id}: ${sample.designs.length}/15 cards; ${inventoryProblems(slots, sample.designs).join("; ") || "structure complete"}`);
  return sample;
};
export const reviewSample = async (sample: Sample, call: Caller) => {
  const review = await validated<Review>(`${sample.id}-review`, {
    stage: "review", total: 135, ideas, blueprint: sample.blueprint,
    slots: sample.slots, designs: sample.designs, scope,
  }, call);
  return { candidateId: sample.id, review };
};
