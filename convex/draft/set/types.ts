import { CardFace } from "../../card";
import type { CreativeSeed } from "./creativeSeed";
import type { WorldDirection } from "./worldDirection";

export const COLORS = ["W", "U", "B", "R", "G"] as const;
export const PAIRS = [
  "WU",
  "WB",
  "WR",
  "WG",
  "UB",
  "UR",
  "UG",
  "BR",
  "BG",
  "RG",
] as const;
export type Color = (typeof COLORS)[number];
export type Pair = (typeof PAIRS)[number];
export type Rarity = "common" | "uncommon" | "rare" | "mythic";
export type Blueprint = {
  world: {
    name: string;
    premise: string;
    description: string;
    conflict: string;
    tone: string;
  };
  experience: {
    pace: string;
    power: string;
    interaction: string;
    exclusions: string[];
  };
  colors: {
    color: Color;
    role: string;
    strengths: string;
    weaknesses: string;
    visual: string;
  }[];
  archetypes: {
    id: Pair;
    name: string;
    earlyGame: string;
    engine: string;
    winCondition: string;
    weaknesses: string;
    enablers: string;
    payoffs: string;
    neighbors: Pair[];
  }[];
  mechanics: {
    id: string;
    name: string;
    isNew: boolean;
    rules: string;
    reminder: string;
    support: string;
    counterplay: string;
    example: string;
  }[];
  creative: {
    materials: string;
    silhouettes: string;
    locations: string;
    motifs: string;
    naming: string;
    exclusions: string;
  };
  influences: { idea: number; interpretation: string }[];
};
export type Slot = {
  id: string;
  colors: Color[];
  rarity: Rarity;
  type:
    | "Creature"
    | "Instant"
    | "Sorcery"
    | "Enchantment"
    | "Artifact"
    | "Land";
  minMana: number;
  maxMana: number;
  role: string;
  archetypes: Pair[];
  mechanics: string[];
  motif: string;
};
export type Design = { slotId: string; face: CardFace; tokens: string[] };
export type Issue = {
  id: string;
  slots: string[];
  severity: "blocker" | "major" | "minor";
  evidence: string;
  correction: string;
};
export type Review = {
  summary: string;
  blueprintBroken: boolean;
  issues: Issue[];
};
export type Screening = {
  name: string;
  choice: string;
  confidence: number;
  probabilities: { value: string; probability: number }[];
};
export type Usage = {
  input: number;
  output: number;
  reasoning: number;
  cost: number;
  requestId: string;
};
export type Stage =
  | "brief"
  | "slots"
  | "generate"
  | "screen"
  | "review"
  | "editPlan"
  | "revise"
  | "rescreen"
  | "final"
  | "art";
export type Task = {
  stage: Stage;
  total: number;
  ideas: string[];
  creativeSeed?: CreativeSeed;
  worldDirection?: WorldDirection;
  blueprint?: Blueprint;
  slots?: Slot[];
  designs?: Design[];
  issues?: Issue[];
  screens?: Screening[];
  scope?: string;
  feedback?: string;
  reservedNames?: string[];
};
export const VERSIONS = {
  pipeline: 2,
  prompt: 9,
  profile: 2,
  schema: 1,
  rubric: 4,
  references: 2,
  collation: 1,
};
export const MODELS = { luna: "gpt-6-luna" };
