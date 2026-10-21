import { readFile, writeFile, mkdir } from "node:fs/promises";
import { resolve, join } from "node:path";
import { createHash } from "node:crypto";
import { createCaller, pool } from "../batch-eval/calls";
import { validated } from "../creativity-eval/run";
import { fixtureTask, fixtures, bundles } from "./fixtures";
import { observedFiles, observedTask } from "./observed";
import { worldDirection, WorldDirection } from "../../convex/draft/set/worldDirection";
import { Blueprint, Review, VERSIONS } from "../../convex/draft/set/types";

const out = resolve(process.argv[2] ?? ".artifacts/release-probes-v11");
if (!process.env.OPENAI_API_KEY || process.env.OPENAI_BASE_URL !== "https://api.openai.com") throw new Error("Real official API required");
await mkdir(out, { recursive: true });
const recent: WorldDirection[] = [];
const worlds = bundles.map((ideas, i) => {
  const direction = worldDirection(202610800 + i, recent); recent.unshift(direction);
  return { id: `world-${i}`, ideas, direction };
});
const sourceHash = createHash("sha256").update(await readFile("scripts/release-eval/fixtures.ts")).digest("hex");
const observedHashes = Object.fromEntries(await Promise.all(observedFiles.map(async file => [file, createHash("sha256").update(await readFile(file)).digest("hex")])));
const config = { observedHashes, versions: VERSIONS, sourceHash, fixtures, worlds, repeats: 2,
  limitation: "Fresh editorial fixtures; expectations not supplied to model. Ambiguous floor judgements are separate from definite contract defects. Twelve world probes are qualitative, not a creativity score." };
const file = join(out, "config.json"), previous = await readFile(file, "utf8").catch(() => null);
if (previous && previous !== JSON.stringify(config, null, 2)) throw new Error("Changed frozen probe config");
await writeFile(file, JSON.stringify(config, null, 2));
const reviews = await createCaller(join(out, "review"), 1);
const reviewResults = await pool((["default", "busted"] as const).flatMap(powerLevel => [0, 1].map(repeat => ({ powerLevel, repeat }))), async item => {
  const review = await validated<Review>(`${item.powerLevel}-${item.repeat}`, fixtureTask(item.powerLevel), reviews);
  return { ...item, review };
});
await writeFile(join(out, "reviews.json"), JSON.stringify(reviewResults, null, 2));
const regression = await observedTask();
const observed = await pool([0, 1], async repeat => ({ repeat, review: await validated<Review>(`observed-${repeat}`, regression, reviews) }));
await writeFile(join(out, "observed.json"), JSON.stringify({ task: regression, results: observed, limitation: "Five observed development failures; not held out. Check stale-cost claims, legal timing/targeting and fictional timing separately from real rules defects." }, null, 2));
const caller = await createCaller(join(out, "worlds"), 1);
const worldResults = await pool(worlds, async item => {
  try { return { ...item, blueprint: await validated<Blueprint>(item.id, { stage: "brief", total: 135,
    powerLevel: "default", referenceSeed: item.direction.seed, ideas: item.ideas, worldDirection: item.direction }, caller) }; }
  catch (e) { return { ...item, error: String(e) }; }
});
await writeFile(join(out, "worlds.json"), JSON.stringify(worldResults, null, 2));
