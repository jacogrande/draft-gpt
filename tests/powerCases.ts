import { Design, Slot, Task } from "../convex/draft/set/types";
import { cannedBlueprint } from "./cannedSet";

type Case = {
  slot: Slot;
  card: Design;
  expect: { floor: boolean; ceiling: boolean; slot: boolean };
};
const make = (
  id: string,
  name: string,
  type: Slot["type"],
  color: "W" | "U" | "B" | "R" | "G" | null,
  mana: string,
  value: number,
  role: string,
  rules: string,
  power: number,
  toughness: number,
  expect: Case["expect"],
  mechanics: string[] = []
): Case => ({
  slot: {
    id,
    colors: color ? [color] : [],
    rarity: "common",
    type,
    minMana: value,
    maxMana: value,
    role,
    archetypes: [],
    mechanics,
    motif: "Coastal work",
  },
  card: {
    slotId: id,
    tokens: [],
    face: {
      name,
      image_url: null,
      mana_cost: mana,
      type,
      subtype:
        type === "Creature"
          ? "Human Scout"
          : type === "Artifact" && role.includes("equipment")
          ? "Equipment"
          : "",
      rarity: "common",
      rules_text: rules,
      power,
      toughness,
      set: "Glasswake",
      legendary: false,
      flavor_text: "",
      art_direction:
        type === "Creature"
          ? "A scout watches the bridge from a timber tower."
          : "An iron tool lies on a wooden bench.",
    },
  },
  expect,
});
const pass = { floor: false, ceiling: false, slot: false };
export const powerCases: Case[] = [
  make(
    "E001",
    "Bridge Watchman",
    "Creature",
    "W",
    "{4}{W}",
    5,
    "Midrange team support creature",
    "Other creatures you control get +0/+1.",
    2,
    2,
    { ...pass, floor: true }
  ),
  make(
    "E002",
    "Sort the Charts",
    "Sorcery",
    "U",
    "{1}{U}",
    2,
    "Card selection with flashback for graveyard decks",
    "Draw a card, then discard a card. Scry 2.",
    0,
    0,
    { ...pass, floor: true, slot: true },
    ["flashback"]
  ),
  make(
    "E003",
    "Copper Dynamo",
    "Artifact",
    null,
    "{0}",
    0,
    "Mana rock acceleration",
    "{T}: Add {G}{G}{G}.",
    0,
    0,
    { ...pass, ceiling: true }
  ),
  make(
    "E004",
    "Bridge Jailer",
    "Creature",
    "B",
    "{1}{B}",
    2,
    "Early threat",
    "Your opponents can't cast spells.",
    3,
    3,
    { ...pass, ceiling: true }
  ),
  make(
    "E005",
    "Woodland Porter",
    "Creature",
    "G",
    "{1}{G}",
    2,
    "Efficient early creature providing a resource on death",
    "When this creature dies, draw a card.",
    2,
    2,
    pass
  ),
  make(
    "E006",
    "Torch the Rope",
    "Instant",
    "R",
    "{R}",
    1,
    "Cheap damage interaction",
    "Torch the Rope deals 2 damage to any target.",
    0,
    0,
    pass
  ),
  make(
    "E007",
    "Boarding Axe",
    "Artifact",
    null,
    "{1}",
    1,
    "Cheap equipment combat bonus",
    "Equipped creature gets +2/+0.\nEquip {1}",
    0,
    0,
    pass
  ),
  make(
    "E008",
    "Shore Rescuer",
    "Creature",
    "W",
    "{2}{W}",
    3,
    "Efficient resource creature with immediate card advantage",
    "Vigilance\nWhen this creature enters, draw a card.",
    3,
    3,
    pass
  ),
];
export const powerTask = (stage: Task["stage"]): Task => ({
  stage,
  total: 135,
  ideas: [],
  blueprint: {
    ...cannedBlueprint,
    experience: {
      ...cannedBlueprint.experience,
      power: "Modern Horizons strength",
    },
    mechanics: [
      {
        id: "flashback",
        name: "Flashback",
        isNew: false,
        rules:
          "You may cast this card from your graveyard for its flashback cost. Then exile it.",
        reminder:
          "You may cast this card from your graveyard for its flashback cost. Then exile it.",
        support: "Cheap spells and discard",
        counterplay: "Graveyard removal",
        example: "Flashback {3}{U}",
      },
    ],
  },
  slots: powerCases.map((c) => c.slot),
  designs: powerCases.map((c) => c.card),
  scope:
    "Development sample of individual cards, not a full inventory. Inspect only supplied cards; do not infer absent support from omitted cards.",
});
