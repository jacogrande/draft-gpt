import { PAIRS, Task } from "./types";

export const supportReport = (task: Task) => {
  const slots = task.slots ?? [],
    cards = task.designs ?? [];
  const inspected = new Set(cards.map((c) => c.slotId));
  const slotIds = new Set(slots.map((s) => s.id));
  const complete =
    slots.length === task.total &&
    slotIds.size === task.total &&
    cards.length === task.total &&
    inspected.size === task.total &&
    [...inspected].every((id) => slotIds.has(id));
  return {
    coverage: complete ? "complete_inventory" : "partial_sample",
    expected: task.total,
    planned: slots.length,
    inspected: cards.length,
    limitation:
      "Counts describe assignment and visible text, not proven synergy, balance or draft exposure. Do not infer missing cards from a partial sample or declare the entire set ready.",
    pairs: PAIRS.map((pair) => ({
      pair,
      assignedCommons: slots.filter(
        (s) => s.rarity === "common" && s.archetypes.includes(pair)
      ).length,
      inspected: slots.filter(
        (s) => inspected.has(s.id) && s.archetypes.includes(pair)
      ).length,
    })),
    curve: [0, 1, 2, 3, 4, 5, 6, 7].map((mana) => ({
      mana: mana === 7 ? "7+" : String(mana),
      creatures: cards.filter((c) => {
        const cost = [
          ...c.face.mana_cost.matchAll(/\{(\d+|[WUBRG])\}/g),
        ].reduce((n, m) => n + (/^\d+$/.test(m[1]) ? Number(m[1]) : 1), 0);
        return (
          c.face.type === "Creature" && (mana === 7 ? cost >= 7 : cost === mana)
        );
      }).length,
    })),
    mechanicChecks: slots
      .filter((s) => inspected.has(s.id))
      .flatMap((slot) =>
        slot.mechanics.flatMap((id) => {
          const mechanic = task.blueprint?.mechanics.find((m) => m.id === id);
          const card = cards.find((c) => c.slotId === slot.id)!;
          if (
            !mechanic ||
            card.face.rules_text
              .toLowerCase()
              .includes(mechanic.name.toLowerCase())
          )
            return [];
          return [
            {
              slotId: slot.id,
              mechanic: mechanic.name,
              observation:
                "Assigned mechanic name is absent from rules text. Check semantic implementation; absence alone is not proof of a defect.",
            },
          ];
        })
      ),
  };
};
