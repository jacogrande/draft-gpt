import { preferencePlanSchema } from "./intent";
import { arr, bool, choice, nonempty as s, num, obj, str } from "./schema";
import { COLORS, PAIRS } from "./types";

export const blueprintSchema = obj({
  world: obj({
    name: s(80),
    premise: s(350),
    description: s(),
    conflict: s(),
    tone: s(300),
  }),
  experience: obj({
    pace: s(),
    power: s(),
    interaction: s(),
    exclusions: arr(s(300), 1, 8),
  }),
  colors: arr(
    obj({
      color: choice(COLORS),
      role: s(),
      strengths: s(),
      weaknesses: s(),
      visual: s(),
    }),
    5,
    5
  ),
  archetypes: arr(
    obj({
      id: choice(PAIRS),
      name: s(100),
      earlyGame: s(),
      engine: s(),
      winCondition: s(),
      weaknesses: s(),
      enablers: s(),
      payoffs: s(),
      neighbors: arr(choice(PAIRS), 2, 4),
    }),
    10,
    10
  ),
  mechanics: arr(
    obj({
      id: s(50),
      name: s(100),
      isNew: bool,
      rules: s(),
      reminder: s(600),
      support: s(),
      counterplay: s(),
      example: s(),
    }),
    0,
    5
  ),
  creative: obj({
    materials: s(),
    silhouettes: s(),
    locations: s(),
    motifs: s(),
    naming: s(),
    exclusions: s(),
  }),
  influences: arr(obj({ idea: num(0, 39), interpretation: s(500) }), 0, 40),
});
export const slotSchema = obj({
  id: s(30),
  colors: arr(choice(COLORS), 0, 2),
  rarity: choice(["common", "uncommon", "rare", "mythic"]),
  type: choice([
    "Creature",
    "Instant",
    "Sorcery",
    "Enchantment",
    "Artifact",
    "Land",
  ]),
  minMana: num(0, 9),
  maxMana: num(0, 12),
  role: s(300),
  archetypes: arr(choice(PAIRS), 1, 4),
  mechanics: arr(s(50), 0, 3),
  motif: s(300),
});
export const slotPlanSchema = obj({ slots: arr(slotSchema, 15, 270) });
export const designSchema = obj({
  slotId: s(30),
  face: obj({
    name: s(100),
    mana_cost: str(100),
    art_direction: s(1200),
    type: s(100),
    subtype: str(100),
    rarity: choice(["common", "uncommon", "rare", "mythic"]),
    rules_text: str(1300),
    flavor_text: str(350),
    power: num(0, 30),
    toughness: num(0, 30),
    set: s(80),
    legendary: bool,
  }),
  tokens: arr(s(500), 0, 5),
});
export const designBatchSchema = (size = 15) => {
  if (!Number.isInteger(size) || size < 1 || size > 135)
    throw new Error("Design batch must contain 1–135 slots");
  return obj({ cards: arr(designSchema, 1, size) });
};
export const designsSchema = designBatchSchema();
export const reviewSchema = obj({
  summary: s(2000),
  blueprintBroken: bool,
  issues: arr(
    obj({
      id: s(80),
      slots: arr(s(30), 1, 270),
      severity: choice(["blocker", "major", "minor"]),
      evidence: s(1500),
      correction: s(1500),
    }),
    0,
    100
  ),
});

export const worldSchema = (withPreferences: boolean) => withPreferences
  ? obj({ ...blueprintSchema.properties!, preferencePlan: preferencePlanSchema }) : blueprintSchema;
export const plannedSlotSchema = (withPreferences: boolean) => withPreferences
  ? obj({ ...slotSchema.properties!, preferenceIds: arr(s(40), 0, 5) }) : slotSchema;
export const planningSchema = (withPreferences: boolean) => obj({ slots: arr(plannedSlotSchema(withPreferences), 15, 270) });
