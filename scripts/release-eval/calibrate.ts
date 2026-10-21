import { readFile, writeFile, mkdir } from "node:fs/promises";
import { resolve, join } from "node:path";
import { createHash } from "node:crypto";
import { createCaller, pool } from "../batch-eval/calls";
import { validated } from "../creativity-eval/run";
import { fixtureTask, fixtures } from "./fixtures";
import { parseDesigns } from "../../convex/draft/set/parsing";
import { Review, VERSIONS } from "../../convex/draft/set/types";

const out = resolve(process.argv[2]);
if (!process.env.OPENAI_API_KEY || process.env.OPENAI_BASE_URL !== "https://api.openai.com") throw new Error("Real official API required");
for (const mode of ["default", "busted"] as const) {
  const task = fixtureTask(mode);
  const parsed = parseDesigns({ cards: task.designs!.map(card => ({ ...card, face: Object.fromEntries(Object.entries(card.face).filter(([key]) => key !== "image_url")) })) }, task.slots!, task.blueprint!);
  if (parsed.cards.length !== fixtures.length || parsed.errors.length) throw new Error(parsed.errors.join("; "));
}
await mkdir(out, { recursive: true });
const config = { versions: VERSIONS, fixtures,
  sourceHash: createHash("sha256").update(await readFile("scripts/release-eval/fixtures.ts")).digest("hex"),
  limitation: "Corrected zero-mana slot metadata. Prior calibration is preserved, not replaced. No prompt changes; four fresh requests, two repetitions per mode. Expectations remain outside provider inputs." };
const file = join(out, "config.json"), previous = await readFile(file, "utf8").catch(() => null);
if (previous && previous !== JSON.stringify(config, null, 2)) throw new Error("Changed frozen calibration config");
await writeFile(file, JSON.stringify(config, null, 2));
const caller = await createCaller(join(out, "review"), .5);
const results = await pool((["default", "busted"] as const).flatMap(powerLevel => [0, 1].map(repeat => ({ powerLevel, repeat }))), async item => ({
  ...item, review: await validated<Review>(`${item.powerLevel}-${item.repeat}`, fixtureTask(item.powerLevel), caller)
}));
await writeFile(join(out, "reviews.json"), JSON.stringify(results, null, 2));
