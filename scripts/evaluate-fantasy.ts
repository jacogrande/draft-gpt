import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile, readdir } from "node:fs/promises";
import { resolve, join } from "node:path";
import { MODELS, VERSIONS } from "../convex/draft/set/types";
import { createCaller, pool, CallRecord } from "./batch-eval/calls";
import { arms, blocks, ideas, sampleSlots, BASELINE_SLOTS, limitations } from "./fantasy-eval/protocol";
import { generateWorld, reviewWorld } from "./fantasy-eval/run";
import { compareSamples } from "./creativity-eval/metrics";

const out = resolve(process.argv[2] ?? ".artifacts/fantasy-eval-v2");
if (VERSIONS.prompt !== 8) throw new Error("Fantasy protocol 2 requires prompt 8");
if (!process.env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is required");
if (process.env.OPENAI_BASE_URL && process.env.OPENAI_BASE_URL !== "https://api.openai.com")
  throw new Error("Real evaluation requires the official API endpoint");
const files = [
  "scripts/evaluate-fantasy.ts", "scripts/fantasy-eval/protocol.ts", "scripts/fantasy-eval/run.ts",
  "scripts/creativity-eval/protocol.ts", "scripts/creativity-eval/run.ts", "scripts/creativity-eval/metrics.ts",
  "scripts/batch-eval/calls.ts", "scripts/batch-eval/generate.ts", "convex/draft/openai.ts", "convex/draft/parsing.ts",
  ...(await readdir("convex/draft/set")).filter((f) => f.endsWith(".ts") && !f.endsWith(".test.ts")).map((f) => `convex/draft/set/${f}`),
  ...(await readdir("convex/draft/set/catalog")).map((f) => `convex/draft/set/catalog/${f}`),
];
const hashes = Object.fromEntries(await Promise.all(files.sort().map(async (file) =>
  [file, createHash("sha256").update(await readFile(file)).digest("hex")])));
const config = { protocol: 2, date: "2026-10-20", versions: VERSIONS, models: MODELS,
  arms, blocks, ideas, sampleSlots, baselineSlotInstructions: BASELINE_SLOTS,
  budget: 3, concurrency: 4, hashes, limitations };
await mkdir(out, { recursive: true });
const configFile = join(out, "config.json");
const previous = await readFile(configFile, "utf8").catch(() => null);
if (previous && JSON.stringify(JSON.parse(previous)) !== JSON.stringify(config))
  throw new Error("Protocol or code changed; use a fresh output directory");
await writeFile(configFile, JSON.stringify(config, null, 2));
const call = await createCaller(out, config.budget);
const schedule = blocks.flatMap((block) => block.order.map((id) => ({ block, arm: arms.find((a) => a.id === id)! })));
const samples = await pool(schedule, ({ arm, block }) => generateWorld(out, arm, block, call));
const reviews = await pool(samples, (sample) => reviewWorld(sample, call));
const records: CallRecord[] = await Promise.all((await readdir(join(out, "calls"))).filter((f) => f.endsWith(".json"))
  .sort().map(async (f) => JSON.parse(await readFile(join(out, "calls", f), "utf8"))));
const ledger = JSON.parse(await readFile(join(out, "ledger.json"), "utf8")) as { cost: number; state: string }[];
const comparisons = arms.flatMap((arm) => {
  const group = samples.filter((s) => s.arm.id === arm.id);
  return group.flatMap((left, index) => group.slice(index + 1).map((right) => compareSamples(left, right)));
});
const summary = { config, samples, reviews, comparisons,
  calls: records.map((r) => ({ id: r.id, durationMs: r.durationMs, stage: r.task.stage,
    usage: r.result?.usage, error: r.transportError ?? r.result?.error })),
  estimatedCost: ledger.reduce((n, x) => n + x.cost, 0),
  pending: ledger.filter((x) => x.state === "pending").length,
  acceptedCards: samples.reduce((n, s) => n + s.designs.length, 0),
  requestCount: records.length };
await writeFile(join(out, "comparison.json"), JSON.stringify(summary, null, 2));
console.log(`Saved ${summary.acceptedCards}/150 cards, ${reviews.length} reviews, ${records.length} requests; $${summary.estimatedCost.toFixed(5)} estimated. ${out}`);
if (summary.acceptedCards !== 150 || samples.some((s) => s.inventoryProblems.length || s.batches.some((b) => b.missing.length)))
  throw new Error("Some sample contracts remain incomplete; inspect saved failures");
