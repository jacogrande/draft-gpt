import { Design } from "../../convex/draft/set/types";
import { Sample } from "./run";

export const normalizedRules = (card: Design) => {
  const name = card.face.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return card.face.rules_text.replace(new RegExp(name, "gi"), "CARD")
    .toLowerCase().replace(/\s+/g, " ").trim();
};
export const signature = (card: Design) => JSON.stringify([
  card.face.mana_cost, card.face.type, card.face.subtype, card.face.legendary,
  card.face.power, card.face.toughness, normalizedRules(card),
]);
export const wordOverlap = (a: string, b: string) => {
  const words = (s: string) => new Set(s.toLowerCase().match(/[a-z0-9]+/g) ?? []);
  const left = words(a), right = words(b);
  const union = new Set([...left, ...right]);
  return union.size ? [...left].filter((w) => right.has(w)).length / union.size : 1;
};
export const compareSamples = (a: Sample, b: Sample) => {
  const matched = a.designs.flatMap((card) => {
    const other = b.designs.find((d) => d.slotId === card.slotId);
    return other ? [{ slotId: card.slotId, exact: signature(card) === signature(other),
      overlap: wordOverlap(normalizedRules(card), normalizedRules(other)) }] : [];
  });
  return { left: a.id, right: b.id, comparedSlots: matched.length,
    exact: matched.filter((m) => m.exact).length,
    meanRulesWordOverlap: matched.length ? matched.reduce((n, m) => n + m.overlap, 0) / matched.length : null,
    matchingNames: a.designs.filter((d) => b.designs.some((e) => e.face.name.toLowerCase() === d.face.name.toLowerCase())).length,
    slots: matched };
};
