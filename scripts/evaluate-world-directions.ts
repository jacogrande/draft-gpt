import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { Blueprint, MODELS, VERSIONS } from "../convex/draft/set/types";
import { worldDirection, WorldDirection } from "../convex/draft/set/worldDirection";
import { createCaller, pool } from "./batch-eval/calls";
import { validated } from "./creativity-eval/run";

const out = resolve(process.argv[2] ?? ".artifacts/world-directions-v9");
if (VERSIONS.prompt !== 9) throw new Error("This probe requires prompt 9");
if (!process.env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is required");
if (process.env.OPENAI_BASE_URL && process.env.OPENAI_BASE_URL !== "https://api.openai.com")
  throw new Error("Real probe requires the official API endpoint");
const recent: WorldDirection[] = [];
const directions = [202610201, 202610202, 202610203, 202610204, 202610205].map((seed) => {
  const direction = worldDirection(seed, recent);
  recent.unshift(direction);
  return direction;
});
const files = [
  "scripts/evaluate-world-directions.ts", "scripts/batch-eval/calls.ts",
  "scripts/creativity-eval/run.ts", "scripts/creativity-eval/protocol.ts",
  "convex/draft/openai.ts", "convex/draft/parsing.ts", "convex/draft/setRuns.ts",
  ...(await readdir("convex/draft/set")).filter((f) => f.endsWith(".ts") && !f.endsWith(".test.ts")).map((f) => `convex/draft/set/${f}`),
  ...(await readdir("convex/draft/set/catalog")).map((f) => `convex/draft/set/catalog/${f}`),
];
const hashes = Object.fromEntries(await Promise.all(files.map(async (file) =>
  [file, createHash("sha256").update(await readFile(file)).digest("hex")])));
const config = {
  protocol: "world-directions-v9", versions: VERSIONS, models: MODELS,
  ideas: [], total: 135, directions, budget: 1, hashes,
  limitations: "Five full world/archetype briefs only; no cards, art, gameplay review or playtesting. New directions use the same least-recent-use allocator as app runs, starting with empty history. No rerolls for taste. Historical prompt-8 outputs are references, not concurrent control runs. Structural acceptance and distinct categories do not establish semantic originality or literal-prose quality.",
};
await mkdir(out, { recursive: true });
const file = join(out, "config.json");
const saved = await readFile(file, "utf8").catch(() => null);
if (saved && JSON.stringify(JSON.parse(saved)) !== JSON.stringify(config))
  throw new Error("Probe inputs or source changed; use a new output directory");
await writeFile(file, JSON.stringify(config, null, 2));
const call = await createCaller(out, config.budget);
const worlds = await pool(directions, async (direction, index) => {
  const id = `world-${index + 1}`;
  const blueprint = await validated<Blueprint>(id, {
    stage: "brief", total: config.total, ideas: [], worldDirection: direction,
  }, call);
  const world = { id, direction, blueprint };
  await writeFile(join(out, `${id}.json`), JSON.stringify(world, null, 2));
  console.log(`${id}: ${blueprint.world.name}`);
  return world;
});
const ledger = JSON.parse(await readFile(join(out, "ledger.json"), "utf8")) as { state: string; cost: number }[];
const result = { config, worlds, estimatedCost: ledger.reduce((sum, row) => sum + row.cost, 0),
  requestCount: ledger.length, pending: ledger.filter((row) => row.state === "pending").length };
await writeFile(join(out, "worlds.json"), JSON.stringify(result, null, 2));
console.log(`Saved ${worlds.length} worlds; ${result.requestCount} requests; $${result.estimatedCost.toFixed(5)} estimated.`);
