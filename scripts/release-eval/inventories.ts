import { readFile, writeFile } from "node:fs/promises";
import { resolve, join } from "node:path";
import { Blueprint, Design, Slot } from "../../convex/draft/set/types";
import { inventoryProblems, parseDesigns } from "../../convex/draft/set/parsing";
import { supportReport } from "../../convex/draft/set/support";
import { signature } from "../creativity-eval/metrics";

const out = resolve(process.argv[2]);
const { results } = JSON.parse(await readFile(join(out, "results.json"), "utf8")) as { results: {
  trial: { id: string; total: number }; blueprint: Blueprint; slots: Slot[]; designs: Design[] }[] };
const duplicates = (cards: Design[], key: (card: Design) => string) => {
  const groups = new Map<string, string[]>();
  for (const card of cards) groups.set(key(card), [...(groups.get(key(card)) ?? []), card.slotId]);
  return [...groups].filter(([, ids]) => ids.length > 1).map(([value, slots]) => ({ value, slots }));
};
const audits = await Promise.all(results.map(async result => {
  const initial = JSON.parse(await readFile(join(out, result.trial.id, "initial.json"), "utf8")) as { designs: Design[] };
  const parsed = parseDesigns({ cards: result.designs.map(card => ({ ...card, face: Object.fromEntries(Object.entries(card.face).filter(([key]) => key !== "image_url")) })) }, result.slots, result.blueprint);
  return { id: result.trial.id, inspected: result.designs.length, accepted: parsed.cards.length,
    parserErrors: parsed.errors, inventoryProblems: inventoryProblems(result.slots, result.designs),
    initialDuplicateNames: duplicates(initial.designs, c => c.face.name.toLowerCase()),
    finalDuplicateNames: duplicates(result.designs, c => c.face.name.toLowerCase()),
    exactMechanicalDuplicates: duplicates(result.designs, signature),
    support: supportReport({ stage: "final", total: result.trial.total, ideas: [], blueprint: result.blueprint,
      slots: result.slots, designs: result.designs }) };
}));
await writeFile(join(out, "inventory-audit.json"), JSON.stringify({ audits,
  limitation: "Every saved card is structurally re-parsed. Mechanic-name absence is an observation requiring semantic inspection; identical text can be intentional redundancy. This is not an independent power score or human balance certification." }, null, 2));
console.log(audits.map(a => ({ id: a.id, inspected: a.inspected, accepted: a.accepted,
  problems: a.inventoryProblems, duplicateGroups: a.exactMechanicalDuplicates.length })));
