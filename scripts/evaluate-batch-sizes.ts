import { readFile, writeFile, mkdir } from "node:fs/promises";
import { resolve, join } from "node:path";
import { createHash } from "node:crypto";
import { Blueprint, Slot, Review, Task, VERSIONS, MODELS } from "../convex/draft/set/types";
import { parseBlueprint, parseSlots } from "../convex/draft/set/parsing";
import { skeleton } from "../convex/draft/set/slots";
import { createCaller, backoff, pool } from "./batch-eval/calls";
import { generateCandidate, Candidate } from "./batch-eval/generate";
import { summarize } from "./batch-eval/summary";

const source = resolve(process.argv[2] ?? ".artifacts/pack-preview-v7-review-only/set.json");
const out = resolve(process.argv[3] ?? ".artifacts/batch-size-eval-v1");
if (!process.env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is required");
if (process.env.OPENAI_BASE_URL && process.env.OPENAI_BASE_URL !== "https://api.openai.com")
  throw new Error("Real evaluation requires the official API endpoint");
const previous = JSON.parse(await readFile(source, "utf8")) as {
  blueprint: Blueprint; slots: Slot[]; ideas: string[];
};
parseBlueprint(previous.blueprint, previous.ideas.length);
parseSlots({ slots: previous.slots }, skeleton(135), previous.blueprint);
const base: Task = { stage: "generate", total: 135, ideas: previous.ideas,
  blueprint: previous.blueprint, slots: previous.slots };
const config = { protocol: 1, source, versions: VERSIONS, models: MODELS,
  sourceHash: createHash("sha256").update(JSON.stringify(base)).digest("hex"),
  orders: [[15, 45, 5, 30], [30, 5, 45, 15]], concurrency: 4,
  budget: 3, judgeRepeats: 2,
  outputPolicy: "max(14000, ceil(14000 * requested_slots / 15))",
  limitations: "One frozen world; two generations per size; same-family model judging; no art, gameplay editing or playtesting. Timing covers generation and structural repair only, not full draft startup. Reference retrieval adapts to the slots in each batch under the unchanged 48-card cap." };
await mkdir(out, { recursive: true });
const configPath = join(out, "config.json");
const existing = await readFile(configPath, "utf8").catch(() => null);
if (existing && JSON.stringify(JSON.parse(existing)) !== JSON.stringify(config))
  throw new Error("Evaluation configuration changed; choose a fresh output directory");
await writeFile(configPath, JSON.stringify(config, null, 2));
const call = await createCaller(out, config.budget);
const candidates: Candidate[] = [];
for (const [trial, order] of config.orders.entries()) {
  for (const size of order) {
    const id = `size${size}-trial${trial + 1}`;
    const file = join(out, `${id}.json`);
    const saved = await readFile(file, "utf8").catch(() => null);
    const candidate: Candidate = saved ? JSON.parse(saved) : await generateCandidate(id, base, size, call);
    if (!saved) await writeFile(file, JSON.stringify(candidate, null, 2));
    candidates.push(candidate);
    console.log(`${id} COMPLETE: ${candidate.designs.length}/135 cards, ${(candidate.wallMs / 1000).toFixed(1)}s, ${candidate.inventoryProblems.join("; ") || "inventory valid"}`);
  }
}
const reviews = await pool(candidates.flatMap((candidate) =>
  Array.from({ length: config.judgeRepeats }, (_, repeat) => ({ candidate, repeat }))), async ({ candidate, repeat }) => {
    let task: Task = { ...base, stage: "review", designs: candidate.designs,
      scope: "global", feedback: "Assess this inventory independently. Report concrete rules defects, weak rates against the Modern Horizons references, excessive power, world/slot violations and cohesion gaps. Support claims with card text and full costs. No earlier reviews are supplied." };
    for (let attempt = 0; attempt < 3; attempt++) {
      const record = await call(`${candidate.id}-judge${repeat + 1}-try${attempt}`, task);
      if (record.result?.data)
        return { candidateId: candidate.id, repeat: repeat + 1, review: record.result.data as Review };
      if (record.result?.error) task = { ...task, feedback: record.result.error };
      if (attempt < 2) await backoff(record, attempt);
    }
    return { candidateId: candidate.id, repeat: repeat + 1, review: null };
  });
await writeFile(join(out, "reviews.json"), JSON.stringify(reviews, null, 2));
const summary = summarize(candidates, reviews);
await writeFile(join(out, "summary.json"), JSON.stringify({ config, summary }, null, 2));
console.table(summary);
console.log(`Results saved to ${out}`);
