import { DeckCard } from "./tables";

export const BASIC_LAND_TYPE = "Basic Land";
export const BASIC_LANDS = [
  "plains",
  "forest",
  "mountain",
  "swamp",
  "island",
] as const;

export type BasicLand = (typeof BASIC_LANDS)[number];

type Zones = { cards: DeckCard[]; sideboard: DeckCard[] };

const take = (cards: DeckCard[], cardId: string) => {
  const card = cards.find((candidate) => candidate.id === cardId);
  if (!card) return null;
  return { card, rest: cards.filter((candidate) => candidate !== card) };
};

export const toSideboard = (zones: Zones, cardId: string): Zones | null => {
  const taken = take(zones.cards, cardId);
  if (!taken) return null;
  const isBasic = taken.card.type === BASIC_LAND_TYPE;
  return {
    cards: taken.rest,
    sideboard: isBasic ? zones.sideboard : [...zones.sideboard, taken.card],
  };
};

export const toMainboard = (zones: Zones, cardId: string): Zones | null => {
  const taken = take(zones.sideboard, cardId);
  if (!taken) return null;
  return { cards: [...zones.cards, taken.card], sideboard: taken.rest };
};

export const basicLand = (land: BasicLand, id: string): DeckCard => ({
  id,
  name: land.charAt(0).toUpperCase() + land.slice(1),
  mana_cost: "",
  art_direction: "",
  image_url: `/basics/${land}.jpg`,
  type: BASIC_LAND_TYPE,
  subtype: land,
  rarity: "Common",
  rules_text: "",
  flavor_text: "",
  power: 0,
  toughness: 0,
  set: "",
  legendary: false,
});
