import { creativeSeed } from "../../convex/draft/set/creativeSeed";
import { sampleSlots, shuffled } from "../creativity-eval/protocol";

export { sampleSlots };
export const arms = [
  { id: "baseline", name: "Fantasy baseline", seed: false, perspective: false, jobs: false },
  { id: "SPJ", name: "All three", seed: true, perspective: true, jobs: true },
];
export type Arm = typeof arms[number];
export const ideas: string[] = [];
export const blocks = [202610201, 202610202, 202610203, 202610204, 202610205].map((seed, index) => ({
  repeat: index + 1,
  creativeSeed: creativeSeed(seed),
  order: shuffled(arms.map((a) => a.id), seed ^ 0x4556414c),
}));
export type Block = typeof blocks[number];
export const BASELINE_SLOTS = "Complete every supplied slot exactly once. Preserve id, colors, rarity, type, minMana, maxMana and archetypes. Choose a specific gameplay job and concrete motif, and zero to three defined mechanic IDs. Use the references to plan meaningful output at this cost, not a keyword list. An expensive slot cannot be only a tiny trick, life buffer or single-card recovery. Every assigned mechanic must be implementable by the later card writer.";
export const scope = "This is a fixed fifteen-card preview sample from a planned 135-card world, not a complete set or collated draft pack. Assess only the supplied cards and interactions. Do not infer absent support from omitted cards or promise draft readiness. Report exact rules defects and power floor/ceiling evidence with full costs. Preserve the world's concrete supernatural premise.";
export const limitations = "Five fresh worlds per mode, identical empty player input and fixed fifteen-card contracts. Baseline uses current prompt-8 fantasy guidance without the creative seed/perspective and with the pre-intervention slot instruction. All three uses the actual prompt-8 application policy. This isolates the combined interventions, not the old mundane prompt versus the fantasy rewrite. Each mode gets a fresh stochastic blueprint; pair numbers are presentation blocks, not identical worlds or API sampling seeds. One same-family sample review, no gameplay edits, art or Decisions. These are preview packs, not collated boosters from fully generated sets. Reference retrieval adapts to planned roles. No playtesting or statistical winner; lexical overlap is not a creativity score.";
