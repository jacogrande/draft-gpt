import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { MODELS, VERSIONS } from "../convex/draft/set/types";
import { runTrial, Trial } from "./release-eval/run";

const out = resolve(process.argv[2] ?? ".artifacts/release-eval-v10");
if (!process.env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is required");
if (process.env.OPENAI_BASE_URL && process.env.OPENAI_BASE_URL !== "https://api.openai.com")
  throw new Error("Release evaluation must use the official API endpoint");
const files = ["convex/draft/openai.ts", "convex/draft/parsing.ts", "convex/powerLevel.ts",
  "scripts/evaluate-release.ts", "scripts/release-eval/run.ts", "scripts/batch-eval/calls.ts",
  "scripts/creativity-eval/run.ts",
  ...(await readdir("convex/draft/set")).filter((file) => file.endsWith(".ts") && !file.endsWith(".test.ts")).map((file) => `convex/draft/set/${file}`),
  ...(await readdir("convex/draft/set/catalog")).map((file) => `convex/draft/set/catalog/${file}`)];
const hashes = Object.fromEntries(await Promise.all(files.map(async (file) =>
  [file, createHash("sha256").update(await readFile(file)).digest("hex")])));
const acceptance = process.argv.includes("--acceptance");
if (acceptance) {
  const baseline = JSON.parse(await readFile(".artifacts/release-eval-v10/results.json", "utf8"));
  const baselineCost = baseline.results.reduce((sum: number, result: { estimatedTextCost: number }) =>
    sum + result.estimatedTextCost, 0);
  if (baselineCost + 2 + 12 > 26)
    throw new Error("The follow-up's $12 allowance and $2 probes would exceed the $26 study ceiling");
}
const trials: Trial[] = [135, 270].flatMap((total) => (["default", "busted"] as const).map((powerLevel) => ({
  id: `${powerLevel}-${total}`, total, powerLevel, seed: 202610200 + total,
}))).filter(trial => !acceptance || trial.id === "default-135" || trial.id === "busted-270");
const config = { protocol: "release-v1", versions: VERSIONS, models: MODELS, trials, hashes,
  concurrency: "two candidates; four requests per candidate; eight total",
  budget: "5 USD per 135-card candidate; 7 USD per 270-card candidate",
  limitations: "Matched direction seeds, not identical frozen worlds. Model sampling is nondeterministic. No human playtest." };
await mkdir(out, { recursive: true });
const path = join(out, "config.json");
const previous = await readFile(path, "utf8").catch(() => null);
if (previous && JSON.stringify(JSON.parse(previous)) !== JSON.stringify(config))
  throw new Error("Frozen inputs/source changed; use a new evaluation directory");
await writeFile(path, JSON.stringify(config, null, 2));
const results = [];
for (const group of acceptance ? [trials] : [trials.filter(t => t.total === 135), trials.filter(t => t.total === 270)]) {
  const settled = await Promise.allSettled(group.map((trial) => runTrial(out, trial)));
  for (const item of settled) {
    if (item.status === "fulfilled") results.push(item.value);
    else throw item.reason;
  }
}
await writeFile(join(out, "results.json"), JSON.stringify({ config, results }, null, 2));
