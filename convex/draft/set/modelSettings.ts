import { Stage } from "./types";

export type ReasoningEffort = "none" | "low" | "medium";
export const reasoningEffort = (stage: Stage): ReasoningEffort => {
  if (["interpret", "brief", "slots", "generate", "review", "editPlan"].includes(stage)) return "none";
  return ["final", "revise"].includes(stage) ? "medium" : "low";
};
