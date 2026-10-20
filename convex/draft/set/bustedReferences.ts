import { BUSTED_CATALOG, BUSTED_POOL } from "./bustedCatalog";
import { PowerReference } from "./referenceTypes";
import { Slot } from "./types";

const LIMIT = 48;
const TERMS = /equipment|removal|interaction|draw|selection|tutor|ramp|acceleration|fixing|graveyard|recursion|reanimation|token|sacrifice|counters|engine|payoff|evasion|finisher|early|cheap/gi;
const distance = (slot: Slot, ref: PowerReference) =>
  Math.max(slot.minMana - ref.value, ref.value - slot.maxMana, 0);
const rank = (slot: Slot, ref: PowerReference) => {
  const tags = new Set(slot.role.toLowerCase().match(TERMS) ?? []);
  return [...tags].filter((tag) => ref.role.toLowerCase().includes(tag)).length * 8
    - distance(slot, ref) * 3
    - ref.colors.filter((color) => !slot.colors.includes(color)).length * 5;
};
const ordered = (slot: Slot, cards: PowerReference[]) =>
  cards.filter((card) => card.type === slot.type)
    .sort((a, b) => rank(slot, b) - rank(slot, a) || a.id.localeCompare(b.id));
const hash = (text: string, seed: number) => {
  let value = seed >>> 0;
  for (const char of text) value = Math.imul(value ^ char.charCodeAt(0), 16777619) >>> 0;
  return value;
};

export const bustedReferenceContext = (slots: Slot[], seed = 0) => {
  const choices = slots.map((slot) => {
    const ranked = ordered(slot, BUSTED_CATALOG);
    const near = ranked.filter((ref) => rank(slot, ref) >= rank(slot, ranked[0]) - 3).slice(0, 8);
    const offset = hash(slot.id, seed) % near.length;
    return { slot, cards: [...near.slice(offset), ...near.slice(0, offset)].slice(0, 3) };
  });
  const selected = new Map<string, PowerReference>();
  const add = (card: PowerReference) => {
    if (selected.size < LIMIT) selected.set(card.id, card);
  };
  // Cover each card type before filling the bounded set-wide review context.
  for (const type of new Set(slots.map((slot) => slot.type))) {
    const card = choices.find(({ slot }) => slot.type === type)!.cards[0];
    add(card);
  }
  for (let index = 0; index < 3; index++)
    for (const row of choices) if (row.cards[index]) add(row.cards[index]);
  if (!slots.length) {
    const anchors = BUSTED_POOL.cards.filter((card) => card.sources.includes("power-nine"));
    for (const anchor of anchors) add(BUSTED_CATALOG.find((ref) => ref.name === anchor.name)!);
    for (const name of ["Force of Will", "Swords to Plowshares", "Lightning Bolt", "Reanimate",
      "Sol Ring", "Skullclamp", "Ragavan, Nimble Pilferer", "Solitude", "Channel", "Natural Order"])
      for (const card of BUSTED_CATALOG.filter((ref) => ref.name === name)) add(card);
  }
  const cards = [...selected.values()];
  return {
    pool: { id: "busted", version: BUSTED_POOL.version, size: BUSTED_POOL.cards.length,
      eligible: BUSTED_CATALOG.length },
    policy: "Busted target comparisons from a sourced 1,000-card high-power pool, not an objective ranking. Source rarity is metadata, not a ceiling. Compare complete costs and actual support; never apply Default's too-strong labels. Unsupported layouts are retained in the research pool but excluded from direct slot retrieval. Do not copy names or designs.",
    cards,
    slots: choices.map(({ slot }) => ({
      slotId: slot.id,
      comparisons: ordered(slot, cards).slice(0, 3).map((ref) => ({
        referenceId: ref.id,
        sameRarity: ref.rarity === slot.rarity,
        manaOutsideBand: distance(slot, ref),
        foreignColors: ref.colors.filter((color) => !slot.colors.includes(color)),
      })),
    })),
  };
};
