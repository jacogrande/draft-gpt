import { readFile, writeFile } from "node:fs/promises";
import { resolve, join } from "node:path";
import { paintCard } from "../../convex/draft/images";
import { artPrompt } from "../../convex/draft/artPrompt";
import { pickSchool } from "../../convex/draft/artSchools";
import { seededRandom } from "../../convex/draft/set/collation";
import { settingFromBlueprint } from "../../convex/draft/set/setting";
import { Blueprint, Design } from "../../convex/draft/set/types";
import { pool } from "../batch-eval/calls";

const out = resolve(process.argv[2] ?? ".artifacts/release-eval-v10");
if (!process.env.OPENAI_API_KEY || process.env.OPENAI_BASE_URL !== "https://api.openai.com") throw new Error("Real official API required");
const { results } = JSON.parse(await readFile(join(out, "results.json"), "utf8")) as {
  results: { trial: { id: string; powerLevel: string } }[] };
for (const mode of ["default", "busted"]) {
  const trial = results.find(result => result.trial.powerLevel === mode)!.trial;
  const directory = join(out, trial.id), file = join(directory, "art.json");
  if (await readFile(file, "utf8").catch(() => null)) continue;
  const result = JSON.parse(await readFile(join(directory, "result.json"), "utf8")) as {
    blueprint: Blueprint; pack: Design[]; estimatedTextCost: number; ready: boolean };
  if (!result.pack.length) {
    const diagnostic = await readFile(join(directory, "diagnostic-pack.json"), "utf8").catch(() => null);
    if (diagnostic) result.pack = JSON.parse(diagnostic).pack;
  }
  if (result.estimatedTextCost + result.pack.length * .24 > 5) throw new Error("Art retry allowance exceeds candidate budget");
  const startedAt = new Date().toISOString(), start = Date.now(), deadline = start + 90000;
  await writeFile(file, JSON.stringify({ state: "pending", startedAt,
    maxAttemptAllowance: result.pack.length * .24, note: "Inspect pending records before manually rerunning; do not blindly repay uncertain calls." }, null, 2));
  const images = await pool(result.pack, async (card, index) => {
    const prompt = artPrompt(`${card.face.art_direction}\nWorld motifs: ${result.blueprint.creative.motifs}`,
      settingFromBlueprint(result.blueprint), pickSchool(seededRandom(index + 123)()));
    const started = Date.now();
    const image = await paintCard(prompt, deadline);
    if (image) await writeFile(join(directory, `${card.slotId}.jpg`), new Uint8Array(await image.arrayBuffer()));
    return { slotId: card.slotId, prompt, success: !!image, durationMs: Date.now() - started };
  });
  await writeFile(file, JSON.stringify({ state: "complete", startedAt, durationMs: Date.now() - start, deadlineMs: 90000,
    candidateReady: result.ready, images, estimatedFirstAttemptAllowance: result.pack.length * .04,
    maxAttemptAllowance: result.pack.length * .24,
    limitation: "Diagnostic art for one pack only. Failed candidates remain blocked. Images adapter returns no token usage or attempt count; dollar figures are conservative allowances, not measured billing. Six attempts maximum per image; one shared 90-second deadline, four workers." }, null, 2));
  console.log(`${mode}: ${images.filter(i => i.success).length}/${images.length} images in ${((Date.now() - start)/1000).toFixed(1)}s`);
}
