import { Rarity, Slot } from "./types";

type Band = {
  type: Slot["type"];
  minMana: number;
  maxMana: number;
  role: string;
};
const band = (
  type: Slot["type"],
  minMana: number,
  maxMana: number,
  role: string
): Band => ({ type, minMana, maxMana, role });
const COMMON: Band[] = [
  band("Creature", 1, 2, "early attacker or self-sufficient enabler"),
  band("Creature", 2, 2, "efficient two-drop with useful upside"),
  band("Creature", 2, 3, "curve creature with board or resource value"),
  band("Artifact", 1, 3, "affordable tool, equipment or artifact enabler"),
  band("Instant", 1, 2, "efficient interaction or useful combat trick"),
  band("Creature", 3, 4, "midgame body with immediate value or combat impact"),
  band(
    "Enchantment",
    1,
    3,
    "affordable board effect or engine with immediate value"
  ),
  band("Creature", 1, 2, "early creature supporting neighboring strategies"),
  band("Creature", 2, 3, "efficient evasive creature, enabler or payoff"),
  band("Creature", 4, 5, "impactful threat or value creature"),
  band("Artifact", 2, 4, "useful equipment, fixing or resource engine"),
  band(
    "Instant",
    2,
    4,
    "reliable interaction or meaningful resource advantage"
  ),
  band(
    "Sorcery",
    2,
    4,
    "impactful removal, ramp, card advantage or multiple bodies"
  ),
  band(
    "Creature",
    5,
    6,
    "finisher with immediate value, evasion or substantial board impact"
  ),
];
const UNCOMMON: Band[] = [
  band("Instant", 1, 3, "efficient flexible interaction"),
  band("Sorcery", 2, 4, "strong resource advantage or board swing"),
  band("Enchantment", 2, 4, "archetype engine with immediate value"),
  band("Creature", 3, 5, "efficient threat with a substantial payoff"),
];
const RARE: Band[] = [
  band("Creature", 1, 3, "premium early threat or useful build-around"),
  band("Sorcery", 2, 5, "premium answer or resource advantage"),
  band("Enchantment", 2, 4, "distinctive engine with immediate value"),
  band("Creature", 4, 6, "impactful finisher with interaction windows"),
];
export const curveBand = (rarity: Rarity, row: number): Band => {
  if (rarity === "common") return COMMON[row % COMMON.length];
  if (rarity === "uncommon")
    return UNCOMMON[
      (((row - 4) % UNCOMMON.length) + UNCOMMON.length) % UNCOMMON.length
    ];
  return RARE[row % RARE.length];
};
