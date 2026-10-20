import { Stage } from "./types";

export type ReasoningEffort = "low" | "medium";
export const reasoningEffort = (stage: Stage): ReasoningEffort =>
  ["review", "editPlan", "final", "revise"].includes(stage) ? "medium" : "low";
