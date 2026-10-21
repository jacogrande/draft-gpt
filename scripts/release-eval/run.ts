import { validateRevisionNames } from "../../convex/draft/set/uniqueness";
import { CreativeIntent } from "../../convex/draft/set/intent";
import { ConversationMessage } from "../../convex/lobby/worldbuilding";
import { preferenceCoverageProblems } from "../../convex/draft/set/guidance";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { planTasks } from "../../convex/draft/set/planning";
import { repairCards } from "../../convex/draft/set/repair";
import { duplicateIssues, inventoryProblems } from "../../convex/draft/set/parsing";
import { collate } from "../../convex/draft/set/collation";
import { Blueprint, Design, Review, Slot, Task } from "../../convex/draft/set/types";
import { PowerLevel } from "../../convex/powerLevel";
import { worldDirection } from "../../convex/draft/set/worldDirection";
import { Caller, createCaller, backoff, pool } from "../batch-eval/calls";
import { validated } from "../creativity-eval/run";

export type Trial = { conversation?: ConversationMessage[]; id: string; total: number; powerLevel: PowerLevel; seed: number };
export const runTrial = async (out: string, trial: Trial) => {
  const directory = join(out, trial.id);
  const call = await createCaller(directory, trial.total === 135 ? 5 : 7);
  const saved = await readFile(join(directory, "result.json"), "utf8").catch(() => null);
  if (saved) return JSON.parse(saved);
  const startedAt = new Date().toISOString(), start = Date.now();
  let reused = false;
  const audit: Caller = async (...args) => {
    const record = await call(...args);
    reused ||= !!record.cacheHit;
    return record;
  };
  const phases: { stage: string; durationMs: number }[] = [];
  const phase = async <T>(stage: string, fn: () => Promise<T>): Promise<T> => {
    const begin = Date.now();
    try { return await fn(); }
    finally { phases.push({ stage, durationMs: Date.now() - begin }); }
  };
  const writeCards = async (id: string, original: Task) => {
    let task = original;
    const accepted: Design[] = [];
    for (let attempt = 0; attempt < 3 && task.slots!.length; attempt++) {
      const record = await audit(`${id}-try${attempt}`, task);
      if (record.result?.data && !record.result.error) {
        let result = record.result.data as { cards: Design[]; errors: string[] };
        if (task.stage === "revise") {
          result = validateRevisionNames(result, designs);
          designs = designs.map(card => result.cards.find(edit => edit.slotId === card.slotId) ?? card);
        }
        accepted.push(...result.cards);
        task = repairCards(task, result);
      } else if (record.result?.error) task = { ...task, feedback: record.result.error };
      if (attempt < 2) await backoff(record, attempt);
    }
    if (task.slots!.length) throw new Error(`Unrepaired ${id}: ${task.feedback}`);
    return accepted;
  };
  let blueprint: Blueprint | undefined;
  let intent: CreativeIntent | undefined;
  let slots: Slot[] = [], designs: Design[] = [];
  let reviews: Review[] = [], editPlan: Review | undefined, finalReview: Review | undefined;
  let error: string | undefined;
  let revised: string[] = [];
  try {
    const base = { total: trial.total, powerLevel: trial.powerLevel, referenceSeed: trial.seed, ideas: [] };
    if (trial.conversation?.length) intent = await phase("interpret", () => validated<CreativeIntent>("interpret",
      { ...base, stage: "interpret", conversation: trial.conversation }, audit));
    blueprint = await phase("brief", () => validated<Blueprint>("brief",
      { ...base, intent, stage: "brief", worldDirection: worldDirection(trial.seed) }, audit));
    const context = { ...base, intent, blueprint };
    slots = (await phase("slots", () => pool(planTasks({ ...context, stage: "slots" }, [], [], []),
      (task, i) => validated<Slot[]>(`slots-${i}`, task, audit)))).flat();
    const missingPreferences = preferenceCoverageProblems(slots, blueprint, intent);
    if (missingPreferences.length) throw new Error(missingPreferences.join("; "));
    designs = (await phase("generate", () => pool(planTasks({ ...context, stage: "generate" }, slots, [], []),
      (task, i) => writeCards(`generate-${i}`, task)))).flat();
    if (designs.length !== trial.total) throw new Error(`Incomplete inventory: ${designs.length}/${trial.total}`);
    await writeFile(join(directory, "initial.json"), JSON.stringify({ blueprint, slots, designs }, null, 2));
    reviews = await phase("review", () => pool(planTasks({ ...context, stage: "review" }, slots, designs, []),
      (task, i) => validated<Review>(`review-${i}`, task, audit)));
    const issues = [...reviews.flatMap((review) => review.issues), ...duplicateIssues(designs)];
    editPlan = await phase("editPlan", () => validated<Review>("editPlan",
      planTasks({ ...context, stage: "editPlan" }, slots, designs, issues)[0], audit));
    if (editPlan.blueprintBroken) throw new Error("The frozen blueprint requires a fresh candidate");
    const edits = (await phase("revise", () => pool(
      planTasks({ ...context, stage: "revise" }, slots, designs, editPlan!.issues),
      (task, i) => writeCards(`revise-${i}`, task)))).flat();
    revised = edits.map((design) => design.slotId);
    designs = designs.map((card) => edits.find((edit) => edit.slotId === card.slotId) ?? card);
    finalReview = await phase("final", () => validated<Review>("final",
      planTasks({ ...context, stage: "final" }, slots, designs, editPlan!.issues)[0], audit));
  } catch (failure) { error = String(failure); }
  const problems = inventoryProblems(slots, designs);
  const structurallyComplete = slots.length === trial.total && designs.length === trial.total && !problems.length;
  const ready = structurallyComplete && !!finalReview && !finalReview.blueprintBroken
    && !finalReview.issues.some((issue) => issue.severity !== "minor") && !error;
  const pack = structurallyComplete
    ? collate(designs, 1, trial.seed)[0].map((id) => designs.find((card) => card.slotId === id)!)
    : [];
  const ledger = JSON.parse(await readFile(join(directory, "ledger.json"), "utf8"));
  const result = { trial, startedAt, finishedAt: new Date().toISOString(),
    durationMs: Date.now() - start, latencyComparable: !reused, phases, intent, blueprint, slots, designs,
    reviews, editPlan, finalReview, revised, error, problems, structurallyComplete, ready, pack,
    estimatedTextCost: ledger.reduce((sum: number, row: { cost: number }) => sum + row.cost, 0),
    requests: ledger.length, ledger,
    limitation: "One candidate per mode/size. Text workflow timing excludes art, Convex scheduling and client delivery. Simulations and model review are not human playtests." };
  await writeFile(join(directory, "result.json"), JSON.stringify(result, null, 2));
  console.log(`${trial.id}: ${designs.length}/${trial.total}; ready=${ready}; ${error ?? finalReview?.summary}`);
  return result;
};
