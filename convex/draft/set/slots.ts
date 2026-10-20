import { curveBand } from "./curve";
import { COLORS, PAIRS, Rarity, Slot } from "./types";
import { PowerLevel } from "../../powerLevel";

export const profile = (total: number) => {
  if (total === 135) return { common: 70, uncommon: 40, rare: 20, mythic: 5 };
  if (total === 270) return { common: 140, uncommon: 80, rare: 40, mythic: 10 };
  if (total === 15) return { common: 10, uncommon: 4, rare: 1, mythic: 0 };
  throw new Error("Unsupported set size");
};

export const skeleton = (total: number, powerLevel?: PowerLevel): Slot[] => {
  const slots: Slot[] = [];
  for (const [rarity, count] of Object.entries(profile(total))) {
    for (let n = 0; n < count; n++) {
      const color = COLORS[n % 5];
      const gold = rarity === "uncommon" && n < (total === 15 ? 0 : 10);
      const land = rarity === "uncommon" && n >= 10 && n < 20;
      const index = Math.floor(n / 5);
      const band = curveBand(rarity as Rarity,
        powerLevel === "busted" && rarity === "mythic" ? n : index, powerLevel);
      const artifact = !land && !gold && band.type === "Artifact";
      const colors = gold
        ? [...PAIRS[n]].map((c) => c as typeof color)
        : land || artifact
        ? []
        : [color];
      const type = land ? "Land" : gold ? "Creature" : band.type;
      slots.push({
        id: `${rarity[0].toUpperCase()}${String(n + 1).padStart(3, "0")}`,
        colors,
        rarity: rarity as Rarity,
        type,
        minMana: land ? 0 : gold ? 2 : band.minMana,
        maxMana: land ? 0 : gold ? 3 : band.maxMana,
        role: land
          ? `mana fixing for ${PAIRS[n - 10]}`
          : gold
          ? "archetype signpost"
          : band.role,
        archetypes: gold
          ? [PAIRS[n]]
          : land
          ? [PAIRS[n - 10]]
          : PAIRS.filter((pair) => pair.includes(color)).filter(
              (_, pairIndex) =>
                pairIndex === index % 4 || pairIndex === (index + 1) % 4
            ),
        mechanics: [],
        motif: "a concrete expression of this world's magic",
      });
    }
  }
  return slots;
};

export const chunks = <T>(values: T[], size = 15): T[][] =>
  Array.from({ length: Math.ceil(values.length / size) }, (_, i) =>
    values.slice(i * size, (i + 1) * size)
  );
