import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile, readdir } from "node:fs/promises";
import { resolve, join } from "node:path";
import { MODELS, VERSIONS } from "../convex/draft/set/types";
import { createCaller, pool, CallRecord } from "./batch-eval/calls";
import { arms, blocks, ideas, sampleSlots, suffix } from "./creativity-eval/protocol";
import { generateSample, reviewSample, Sample } from "./creativity-eval/run";
import { compareSamples } from "./creativity-eval/metrics";

const out = resolve(process.argv[2] ?? ".artifacts/creative-seeding-eval-v1");
if (VERSIONS.prompt !== 7)
  throw new Error("Creative-seeding protocol 1 requires prompt 7: prompt 8 adopts broad jobs by default and changes the fantasy direction. Design a new controlled protocol before making fresh comparisons. Existing comparison.json files can still be rendered.");
if (!process.env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is required");
if (process.env.OPENAI_BASE_URL && process.env.OPENAI_BASE_URL !== "https://api.openai.com")
  throw new Error("Real evaluation requires the official API endpoint");
const files = [
  "scripts/evaluate-creativity.ts", "scripts/creativity-eval/protocol.ts", "scripts/creativity-eval/run.ts", "scripts/creativity-eval/metrics.ts",
  "scripts/batch-eval/calls.ts", "scripts/batch-eval/generate.ts", "convex/draft/openai.ts", "convex/draft/parsing.ts",
  ...(await readdir("convex/draft/set")).filter((f) => f.endsWith(".ts") && !f.endsWith(".test.ts")).map((f) => `convex/draft/set/${f}`),
  ...(await readdir("convex/draft/set/catalog")).map((f) => `convex/draft/set/catalog/${f}`),
];
const hashes = Object.fromEntries(await Promise.all(files.sort().map(async (file) =>
  [file, createHash("sha256").update(await readFile(file)).digest("hex")])));
const config = { protocol: 1, date: "2026-10-20", versions: VERSIONS, models: MODELS,
  arms, blocks, ideas, sampleSlots, budget: 3, concurrency: 4, hashes,
  promptAdditions: blocks.flatMap((block) => arms.map((arm) => ({ arm: arm.id, repeat: block.repeat,
    brief: suffix(arm, block, "brief"), slots: suffix(arm, block, "slots") }))),
  limitations: "Two repeats and one idea bundle; fifteen-card samples, not collated boosters or whole sets. Block-specific seeds/perspectives vary between repeats. References adapt to planned roles. One same-family review per sample; no gameplay editing, art, Decisions, temperature changes or playtesting. Lexical overlap is not a quality or semantic diversity score." };
await mkdir(out, { recursive: true });
const configFile = join(out, "config.json");
const previous = await readFile(configFile, "utf8").catch(() => null);
if (previous && JSON.stringify(JSON.parse(previous)) !== JSON.stringify(config))
  throw new Error("Protocol or code changed; use a fresh output directory");
await writeFile(configFile, JSON.stringify(config, null, 2));
const call = await createCaller(out, config.budget);
const samples: Sample[] = [];
for (const block of blocks) {
  const current = await pool(block.order, async (id) => generateSample(out, arms.find((a) => a.id === id)!, block, call));
  samples.push(...current);
}
const reviews = await pool(samples, (sample) => reviewSample(sample, call));
const records: CallRecord[] = await Promise.all((await readdir(join(out, "calls"))).filter((f) => f.endsWith(".json"))
  .sort().map(async (f) => JSON.parse(await readFile(join(out, "calls", f), "utf8"))));
const ledger = JSON.parse(await readFile(join(out, "ledger.json"), "utf8")) as { cost: number; state: string }[];
const comparisons = arms.map((arm) => compareSamples(samples.find((s) => s.arm.id === arm.id && s.repeat === 1)!, samples.find((s) => s.arm.id === arm.id && s.repeat === 2)!));
const summary = { config, samples, reviews, comparisons, calls: records.map((r) => ({ id: r.id, durationMs: r.durationMs,
  stage: r.task.stage, usage: r.result?.usage, error: r.transportError ?? r.result?.error })),
  estimatedCost: ledger.reduce((n, x) => n + x.cost, 0), pending: ledger.filter((x) => x.state === "pending").length,
  acceptedCards: samples.reduce((n, s) => n + s.designs.length, 0),
  requestCount: records.length };
await writeFile(join(out, "comparison.json"), JSON.stringify(summary, null, 2));
console.log(`Saved ${summary.acceptedCards}/240 cards, ${reviews.length} reviews, ${records.length} requests; $${summary.estimatedCost.toFixed(5)} estimated. ${out}`);
if (summary.acceptedCards !== 240 || samples.some((s) => s.batches.some((b) => b.missing.length)))
  throw new Error("Some requested slots remain unfilled; comparison includes the failures");
