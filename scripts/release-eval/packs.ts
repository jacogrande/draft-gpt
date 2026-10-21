import { readFile, writeFile } from "node:fs/promises";
import { resolve, join } from "node:path";
import { collate } from "../../convex/draft/set/collation";
import { Design } from "../../convex/draft/set/types";

const out = resolve(process.argv[2]);
const { results } = JSON.parse(await readFile(join(out, "results.json"), "utf8")) as {
  results: { trial: { id: string; total: number; seed: number }; designs: Design[]; ready: boolean }[] };
for (const result of results) {
  if (result.designs.length !== result.trial.total || new Set(result.designs.map(d => d.slotId)).size !== result.trial.total) continue;
  const pack = collate(result.designs, 1, result.trial.seed)[0].map(id => result.designs.find(d => d.slotId === id)!);
  await writeFile(join(out, result.trial.id, "diagnostic-pack.json"), JSON.stringify({
    pack, candidateReady: result.ready,
    limitation: "Diagnostic sample from saved designs, including rejected or interrupted candidates. This does not change structural validity, final review or publication status. Duplicate card names can remain."
  }, null, 2));
}
