import { createHash } from "node:crypto";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { Blueprint, Design, Review, Slot, Task, VERSIONS } from "../convex/draft/set/types";
import { CreativeIntent } from "../convex/draft/set/intent";
import { PowerLevel } from "../convex/powerLevel";
import { parseDesigns, duplicateIssues, inventoryProblems } from "../convex/draft/set/parsing";
import { planTasks } from "../convex/draft/set/planning";
import { repairCards } from "../convex/draft/set/repair";
import { validateRevisionNames } from "../convex/draft/set/uniqueness";
import { backoff, createCaller, pool } from "./batch-eval/calls";
import { validated } from "./creativity-eval/run";

const [input, destination] = process.argv.slice(2);
if (!input || !destination) throw new Error("Usage: bun --env-file=.env.local scripts/review-set.ts <saved-set.json> <new-output-directory>");
if (!process.env.OPENAI_API_KEY || process.env.OPENAI_BASE_URL !== "https://api.openai.com") throw new Error("Explicit official API and key required");
const source = await readFile(resolve(input), "utf8");
const saved = JSON.parse(source) as { blueprint: Blueprint; slots: Slot[]; designs: Design[]; intent?: CreativeIntent;
  powerLevel?: PowerLevel; trial?: { powerLevel: PowerLevel; seed: number } };
const powerLevel = saved.powerLevel ?? saved.trial?.powerLevel;
if (!powerLevel || ![135, 270].includes(saved.slots?.length)) throw new Error("A saved complete 135/270-card set with explicit power level is required");
const parsed = saved.designs.flatMap(card => {
  const slot = saved.slots.find(s => s.id === card.slotId);
  if (!slot) throw new Error(`Unknown input slot ${card.slotId}`);
  const result = parseDesigns({ cards: [{ ...card,
    face: Object.fromEntries(Object.entries(card.face).filter(([key]) => key !== "image_url")),
  }] }, [slot], saved.blueprint);
  if (result.errors.length) throw new Error(`Invalid source contracts: ${result.errors.join("; ")}`);
  return result.cards;
});
if (saved.designs.length !== saved.slots.length || new Set(saved.designs.map(d => d.slotId)).size !== saved.slots.length)
  throw new Error("Incomplete input inventory");
const out = resolve(destination);
await mkdir(out, { recursive: true });
const files = ["scripts/review-set.ts", "scripts/batch-eval/calls.ts", "scripts/creativity-eval/run.ts", "convex/draft/openai.ts",
  ...(await readdir("convex/draft/set")).filter(f => f.endsWith(".ts") && !f.endsWith(".test.ts")).map(f => `convex/draft/set/${f}`)];
const hashes = Object.fromEntries(await Promise.all(files.map(async file => [file, createHash("sha256").update(await readFile(file)).digest("hex")])));
const config = JSON.stringify({ versions: VERSIONS, sourceHash: createHash("sha256").update(source).digest("hex"), hashes, budget: 2 }, null, 2);
const existing = await readFile(join(out, "config.json"), "utf8").catch(() => null);
if (existing && existing !== config) throw new Error("Frozen inputs changed; use a new output directory");
await writeFile(join(out, "config.json"), config);
const call = await createCaller(out, 2);
const base = { total: saved.slots.length, ideas: [], blueprint: saved.blueprint, intent: saved.intent,
  powerLevel, referenceSeed: saved.trial?.seed ?? 20261021 };
let designs = parsed;
let reviews: Review[] = [], plan: Review | undefined, final: Review | undefined, error: string | undefined;
const revised: string[] = [];
try {
  reviews = await pool(planTasks({ ...base, stage: "review" }, saved.slots, designs, []),
    (task, i) => validated<Review>(`review-${i}`, task, call));
  const issues = [...reviews.flatMap(r => r.issues), ...duplicateIssues(designs)];
  plan = await validated<Review>("editPlan", planTasks({ ...base, stage: "editPlan" }, saved.slots, designs, issues)[0], call);
  if (plan.blueprintBroken) throw new Error("Frozen blueprint needs repair; no cards rewritten");
  await pool(planTasks({ ...base, stage: "revise" }, saved.slots, designs, plan.issues), async (original: Task, i) => {
    let task = original;
    for (let attempt = 0; attempt < 3 && task.slots!.length; attempt++) {
      const record = await call(`revise-${i}-try${attempt}`, task);
      if (record.result?.data && !record.result.error) {
        const result = validateRevisionNames(record.result.data as { cards: Design[]; errors: string[] }, designs);
        designs = designs.map(card => result.cards.find(edit => edit.slotId === card.slotId) ?? card);
        revised.push(...result.cards.map(card => card.slotId));
        task = repairCards(task, result);
      } else if (record.result?.error) task = { ...task, feedback: record.result.error };
      if (attempt < 2) await backoff(record, attempt);
    }
    if (task.slots!.length) throw new Error(`Unrepaired cards: ${task.feedback}`);
  });
  final = await validated<Review>("final", planTasks({ ...base, stage: "final" }, saved.slots, designs, plan.issues)[0], call);
} catch (failure) { error = String(failure); }
const problems = inventoryProblems(saved.slots, designs);
const ledger = JSON.parse(await readFile(join(out, "ledger.json"), "utf8"));
const ready = !error && !problems.length && !!final && !final.blueprintBroken && !final.issues.some(i => i.severity !== "minor");
await writeFile(join(out, "result.json"), JSON.stringify({ ...saved, designs, reviews, editPlan: plan, finalReview: final, revised, problems, ready, error,
  estimatedTextCost: ledger.reduce((sum: number, row: { cost: number }) => sum + row.cost, 0),
  limitation: "Review of a saved candidate, not a fresh-generation success-rate measurement or human playtest. No art generated." }, null, 2));
console.log(JSON.stringify({ ready, revised: revised.length, problems, error }));
if (!ready) process.exitCode = 1;
