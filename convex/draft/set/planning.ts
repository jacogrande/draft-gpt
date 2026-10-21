import { chunks, skeleton } from "./slots";
import { duplicateIssues, inventoryProblems } from "./parsing";
import { Design, Issue, PAIRS, Slot, Task } from "./types";

export const planTasks = (
  base: Task,
  slots: Slot[],
  designs: Design[],
  issues: Issue[]
): Task[] => {
  let tasks: Task[] = [];
  if (base.stage === "slots")
    tasks = chunks(skeleton(base.total, base.powerLevel)).map((group) => ({
      ...base,
      slots: group,
    }));
  if (base.stage === "generate") {
    tasks = chunks(slots).map((group) => ({ ...base, slots: group }));
  }
  if (base.stage === "review")
    tasks = [...PAIRS, "global"].map((scope) => ({
      ...base,
      scope,
      designs:
        scope === "global"
          ? designs
          : designs.filter((d) =>
              slots
                .find((s) => s.id === d.slotId)
                ?.archetypes.includes(scope as (typeof PAIRS)[number])
            ),
      slots,
      feedback: inventoryProblems(slots, designs).join("; "),
    }));
  if (base.stage === "editPlan" || base.stage === "final")
    tasks = [{ ...base, designs, slots, issues }];
  if (base.stage === "revise") {
    issues = [...issues, ...duplicateIssues(designs)];
    const selected = slots.filter((s) =>
      issues.some((i) => i.slots.includes(s.id))
    );
    tasks = chunks(selected).map((group) => ({
      ...base,
      slots: group,
      designs: designs.filter((d) => group.some((s) => s.id === d.slotId)),
      reservedNames: designs
        .filter((d) => !group.some((s) => s.id === d.slotId))
        .map((d) => d.face.name),
      issues: issues.filter((i) =>
        i.slots.some((id) => group.some((s) => s.id === id))
      ),
    }));
  }
  return tasks;
};
