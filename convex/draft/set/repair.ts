import { Design, Task } from "./types";

export const repairCards = (
  task: Task,
  response: { cards: Design[]; errors: string[] }
): Task => {
  const accepted = new Set(response.cards.map((c) => c.slotId));
  const slots = task.slots!.filter((s) => !accepted.has(s.id));
  const remaining = new Set(slots.map((s) => s.id));
  return {
    ...task,
    slots,
    designs: task.designs?.filter((d) => remaining.has(d.slotId)),
    issues: task.issues?.filter((i) => i.slots.some((id) => remaining.has(id))),
    reservedNames: [
      ...new Set([
        ...(task.reservedNames ?? []),
        ...response.cards.map((c) => c.face.name),
      ]),
    ],
    feedback:
      response.errors.join("; ").slice(0, 3000) +
      " Fixed slot constraints take priority over review suggestions. Keep costs within each slot minMana/maxMana and colors, adjusting effects instead. Do not reuse reservedNames, even if the edit plan proposed renaming the other card. Remaining slots requiring repair: " +
      slots.map((s) => s.id).join(", "),
  };
};
