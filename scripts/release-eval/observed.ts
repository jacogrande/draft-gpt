import { readFile } from "node:fs/promises";
import { Task, Blueprint, Design, Slot, Review } from "../../convex/draft/set/types";

export const observedFiles = [
  ".artifacts/release-eval-v10/busted-135/result.json",
  ".artifacts/release-eval-v10/busted-135/initial.json",
];
export const observedTask = async (): Promise<Task> => {
  const result = JSON.parse(await readFile(observedFiles[0], "utf8")) as {
    blueprint: Blueprint; designs: Design[]; slots: Slot[]; finalReview: Review };
  const initial = JSON.parse(await readFile(observedFiles[1], "utf8")) as { designs: Design[] };
  const ids = ["M001", "M004", "R001", "C025", "U025"];
  const designs = ids.map(id => (id === "C025" || id === "U025" ? initial : result).designs.find(card => card.slotId === id)!);
  return { stage: "final", total: 135, ideas: [], powerLevel: "busted", referenceSeed: 202610335,
    blueprint: result.blueprint, slots: result.slots.filter(slot => ids.includes(slot.id)), designs,
    issues: result.finalReview.issues,
    scope: "Observed development regression subset, not a complete inventory. Inspect supplied current text. Do not infer absent support from omitted cards or declare full-set readiness." };
};
