import { CreativeIntent } from "./intent";
import { Blueprint, Slot, Task } from "./types";

export const creativeGuidance = (task: Task) => {
  const assigned = new Set(task.slots?.flatMap(s => s.preferenceIds ?? []) ?? []);
  const writing = task.stage === "generate" || task.stage === "revise";
  return (task.intent?.preferences ?? []).flatMap(preference => {
    const plan = task.blueprint?.preferencePlan?.find(p => p.preferenceId === preference.id);
    if (preference.status !== "active" || !plan || plan.disposition === "omitted") return [];
    if (writing && ["subject", "gameplay"].includes(preference.kind) && !assigned.has(preference.id)) return [];
    return [{ ...preference, expression: plan.expression, cardGuidance: plan.cardGuidance }];
  });
};

export const preferenceCoverageProblems = (slots: Slot[], blueprint?: Blueprint, intent?: CreativeIntent): string[] =>
  (intent?.preferences ?? []).filter(preference => preference.status === "active"
    && ["subject", "gameplay"].includes(preference.kind)
    && blueprint?.preferencePlan?.some(p => p.preferenceId === preference.id && p.disposition !== "omitted")
    && !slots.some(slot => slot.preferenceIds?.includes(preference.id)))
    .map(preference => `No card slots express preference ${preference.id}`);
