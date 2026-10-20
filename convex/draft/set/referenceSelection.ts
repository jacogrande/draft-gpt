import { common } from "./catalog/common";
import { uncommon } from "./catalog/uncommon";
import { rare } from "./catalog/rare";
import { mythic } from "./catalog/mythic";
import { PowerReference } from "./referenceTypes";
import { Slot } from "./types";
import { PowerLevel } from "../../powerLevel";
import { bustedReferenceContext } from "./bustedReferences";

export const REFERENCE_CATALOG = [...common, ...uncommon, ...rare, ...mythic];
export const REFERENCE_LIMIT = 48;
const tags = [
  /equipment|equip|combat bonus/i,
  /removal|damage|answer|interaction|counterspell|neutraliz/i,
  /draw|card advantage|cantrip|selection|resource/i,
  /ramp|mana rock|acceleration/i,
  /fixing|fixer|land|mana source/i,
  /graveyard|recover|recurs|reanimat|flashback/i,
  /token|multiple bodies|fodder/i,
  /sacrifice|death|dies/i,
  /\bcounters?\b|grow|scal/i,
  /engine|payoff|build.around/i,
  /fly|evasion|evasive/i,
  /finisher|expensive|late.game/i,
  /early|one.drop|two.drop|cheap|attacker/i,
];
const distance = (slot: Slot, ref: PowerReference) =>
  Math.max(slot.minMana - ref.value, ref.value - slot.maxMana, 0);
const rank = (slot: Slot, ref: PowerReference) => {
  const overlap = tags.filter(
    (t) => t.test(slot.role) && t.test(ref.role)
  ).length;
  return (
    overlap * 8 +
    (slot.rarity === ref.rarity ? 6 : 0) -
    distance(slot, ref) * 2 -
    ref.colors.filter((c) => !slot.colors.includes(c)).length * 2
  );
};
export const findPowerReferences = (slot: Slot, band: PowerReference["band"]) =>
  REFERENCE_CATALOG.filter((r) => r.type === slot.type && r.band === band)
    .map((reference) => ({ reference, rank: rank(slot, reference) }))
    .sort(
      (a, b) => b.rank - a.rank || a.reference.id.localeCompare(b.reference.id)
    );

export const referenceContext = (slots: Slot[], powerLevel?: PowerLevel, seed = 0) => {
  if (powerLevel === "busted") return bustedReferenceContext(slots, seed);
  const selected = slots.map((slot) => ({
    slot,
    choices: (["target", "too_weak", "too_strong"] as const)
      .map((band) => findPowerReferences(slot, band)[0]?.reference)
      .filter((r): r is PowerReference => Boolean(r)),
  }));
  const cards = new Map<string, PowerReference>();
  for (let position = 0; position < 3; position++)
    for (const row of selected) {
      const ref = row.choices[position];
      if (ref && cards.size < REFERENCE_LIMIT) cards.set(ref.id, ref);
    }
  return {
    policy:
      "Editorial role anchors, not automatic verdicts. Compare full costs, color, timing and actual support. Preserve each reference's conditions. Different roles or costs are not direct equivalents. A constructed ban is not a Limited rating. Do not copy reference names or designs.",
    cards: [...cards.values()],
    slots: selected.map(({ slot, choices }) => ({
      slotId: slot.id,
      comparisons: choices
        .filter((r) => cards.has(r.id))
        .map((r) => ({
          referenceId: r.id,
          sameRarity: slot.rarity === r.rarity,
          manaOutsideBand: distance(slot, r),
          foreignColors: r.colors.filter((c) => !slot.colors.includes(c)),
          sharedRoleTags: tags.filter(
            (t) => t.test(slot.role) && t.test(r.role)
          ).length,
        })),
    })),
  };
};
