import { readFile, writeFile, readdir } from "node:fs/promises";
import { resolve, join } from "node:path";
import { inventoryProblems } from "../../convex/draft/set/parsing";
import { Blueprint, Design, Review, Slot } from "../../convex/draft/set/types";

const out = resolve(process.argv[2]);
if (!process.argv[2]) throw new Error("Specify the stopped evaluation directory");
const config = JSON.parse(await readFile(join(out, "config.json"), "utf8"));
const results = [];
for (const trial of config.trials) {
  const directory = join(out, trial.id), file = join(directory, "result.json");
  const saved = await readFile(file, "utf8").catch(() => null);
  if (saved) { results.push(JSON.parse(saved)); continue; }
  const initial = JSON.parse(await readFile(join(directory, "initial.json"), "utf8")) as {
    blueprint: Blueprint; slots: Slot[]; designs: Design[] };
  const ledger = JSON.parse(await readFile(join(directory, "ledger.json"), "utf8")) as {
    id: string; state: string; cost: number }[];
  const calls = await Promise.all((await readdir(join(directory, "calls"))).map(async name =>
    JSON.parse(await readFile(join(directory, "calls", name), "utf8"))));
  const reviews: Review[] = calls.filter(c => c.task.stage === "review" && c.result?.data && !c.result.error).map(c => c.result.data);
  const problems = inventoryProblems(initial.slots, initial.designs);
  const result = { trial, ...initial, interrupted: true, ready: false, latencyComparable: false,
    startedAt: calls.map(c => c.startedAt).sort()[0], finishedAt: null, recordedAt: new Date().toISOString(), durationMs: null,
    phases: [], reviews, revised: [], problems, structurallyComplete: !problems.length, pack: [],
    error: "Session interrupted during review; no final result. In-flight reservations retained as uncertain costs. No lost requests were silently replayed.",
    estimatedTextCost: ledger.reduce((sum, row) => sum + row.cost, 0), ledger, requests: ledger.length,
    uncertainRequests: ledger.filter(row => row.state === "pending").map(row => row.id) };
  await writeFile(file, JSON.stringify(result, null, 2)); results.push(result);
}
await writeFile(join(out, "results.json"), JSON.stringify({ config, results }, null, 2));
