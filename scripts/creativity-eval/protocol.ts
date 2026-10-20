import { skeleton } from "../../convex/draft/set/slots";
import { Task } from "../../convex/draft/set/types";

export const arms = [
  { id: "baseline", name: "Current prompts", seed: false, perspective: false, jobs: false },
  { id: "S", name: "World seed", seed: true, perspective: false, jobs: false },
  { id: "P", name: "Professional perspective", seed: false, perspective: true, jobs: false },
  { id: "J", name: "Broad slot jobs", seed: false, perspective: false, jobs: true },
  { id: "SP", name: "Seed + perspective", seed: true, perspective: true, jobs: false },
  { id: "SJ", name: "Seed + broad jobs", seed: true, perspective: false, jobs: true },
  { id: "PJ", name: "Perspective + broad jobs", seed: false, perspective: true, jobs: true },
  { id: "SPJ", name: "All three", seed: true, perspective: true, jobs: true },
];
export type Arm = typeof arms[number];
const palettes = [
  { terrain: "terraced volcanic valley", process: "seasonal migration of burrowing animals", livelihood: "kiln-fired irrigation pipes", conflict: "upstream settlements divert water needed downstream" },
  { terrain: "limestone sinkholes joined by orchard terraces", process: "wet plant fibers stiffen into load-bearing cords overnight", livelihood: "basket lifts carry harvests between cliff villages", conflict: "repair crews disagree with orchard owners over access to the lifts" },
  { terrain: "a broad inland salt basin", process: "groundwater wells surge after distant thunderstorms", livelihood: "reed mats and salt-brick storehouses", conflict: "caravan camps move the boundary stones around shared wells" },
  { terrain: "a forest growing across an abandoned stone quarry", process: "tree roots raise loose blocks each spring", livelihood: "stonecutting and raised sheep pens", conflict: "quarry families and herders claim the same safe routes" },
];
const perspectives = [
  "A canal engineer: notice water levels, gates, erosion, maintenance and who must perform the work.",
  "A field naturalist: notice migration, nesting, camouflage, seasonal food and how livelihoods adapt.",
  "A quartermaster: notice storage, transport, replacement, rationing and competing claims over supplies.",
  "A village carpenter: notice joints, tools, weather damage, repairs and the ordinary people relying on them.",
];
export const shuffled = <T>(values: T[], seed: number): T[] => {
  const copy = [...values];
  let state = seed >>> 0;
  for (let i = copy.length - 1; i > 0; i--) {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    const j = state % (i + 1);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};
const orderedPalettes = shuffled(palettes, 104729);
const orderedPerspectives = shuffled(perspectives, 130363);
export const blocks = [0, 1].map((index) => ({
  repeat: index + 1,
  seed: orderedPalettes[index],
  perspective: orderedPerspectives[index],
  order: shuffled(arms.map((a) => a.id), 65537 + index * 99991),
}));
export type Block = typeof blocks[number];
export const ideas = [
  "A remote inhabited region transformed by a recurring, physically observable natural phenomenon.",
  "Communities disagree about how to live with it. Show believable working lives, concrete places and objects, and a world that supports several different ways to play.",
];
const ids = ["C001", "C007", "C013", "C029", "C045", "C019", "C021", "C057", "C033", "C065", "U006", "U011", "U025", "U029", "R012"];
export const sampleSlots = ids.map((id) => skeleton(135).find((slot) => slot.id === id)!);
export const suffix = (arm: Arm, block: Block, stage: Task["stage"]) => {
  const parts: string[] = [];
  if (stage === "brief" && arm.seed)
    parts.push(`Creative starting ingredients: ${JSON.stringify(block.seed)}. Connect these through one coherent physical dependency. Show who maintains it, what interrupts it, and how communities respond. These ingredients support the player ideas; preserve the response contract, concrete prose, color identities and power target. Do not merely scatter the nouns through an otherwise unrelated world.`);
  if (stage === "brief" && arm.perspective)
    parts.push(`Use this professional perspective to discover concrete setting details and tensions: ${block.perspective} You are still designing the complete draft world and all ten archetypes. Express the observations in the required blueprint fields; do not write a persona monologue or force every color pair into the same strategy.`);
  if (stage === "slots" && arm.jobs)
    parts.push("For each role, specify the gameplay contribution, useful floor and connection to the archetype's resource plan. Leave the card writer room to choose the implementation: do not prescribe a sequence of exact effects, trigger wording, numerical bonuses or a keyword recipe. The motif remains concrete. Keep all fixed slot fields, the Modern Horizons rate target and necessary support. Assign mechanic IDs only when indispensable to that slot's job; assigned mechanics remain mandatory for the writer.");
  return parts.join("\n\n");
};
export const scope = "This is a fixed fifteen-card comparison sample from a planned 135-card world, not a complete set or a collated pack. Assess the supplied cards and observed interactions. Do not infer missing support from omitted cards, promise draft readiness, or rank novelty from names alone. Report exact rules defects and power floor/ceiling evidence with full costs.";
