import { Design } from "./types";

export const normalizedName = (name: string) => name.normalize("NFKC").trim().replace(/\s+/g, " ").toLowerCase();
const textKey = (text: string) => text.trim().replace(/\s+/g, " ").toLowerCase();
const groups = (cards: Design[], key: (card: Design) => string) => {
  const found = new Map<string, string[]>();
  for (const card of cards) {
    const value = key(card);
    if (value) found.set(value, [...(found.get(value) ?? []), card.slotId]);
  }
  return [...found.values()].filter(ids => ids.length > 1);
};
export const uniquenessReport = (cards: Design[]) => ({
  duplicateNames: groups(cards, card => normalizedName(card.face.name)),
  matchingDesigns: groups(cards, ({ face }) => JSON.stringify([
    face.type, face.subtype, face.mana_cost, face.power, face.toughness,
    textKey(face.rules_text).split(textKey(face.name)).join("~"),
  ])),
  repeatedFlavor: groups(cards, card => textKey(card.face.flavor_text)),
  limitation: "Exact text/signature groups only. Shared effects, vanilla creatures and cycles can be intentional; inspect actual gameplay and world roles before requesting changes. Different names do not establish unique designs.",
});

export const validateRevisionNames = (
  response: { cards: Design[]; errors: string[] },
  current: Design[]
): { cards: Design[]; errors: string[] } => {
  const names = new Set<string>();
  const cards: Design[] = [], errors = [...response.errors];
  for (const card of response.cards) {
    const name = normalizedName(card.face.name);
    if (names.has(name) || current.some(other => other.slotId !== card.slotId && normalizedName(other.face.name) === name)) errors.push(`${card.slotId}: name "${card.face.name}" belongs to another current card. Choose a distinct name; preserve all other fixed slot constraints.`);
    else { names.add(name); cards.push(card); }
  }
  return { cards, errors };
};
