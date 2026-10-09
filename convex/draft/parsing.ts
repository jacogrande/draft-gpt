import { CardFace } from "../card";
import { Setting } from "./tables";

type Fields = Record<string, unknown>;

const isFields = (value: unknown): value is Fields =>
  typeof value === "object" && value !== null;

const text = (value: unknown): string =>
  typeof value === "string" ? value : "";

const wholeNumber = (value: unknown): number =>
  typeof value === "number" && Number.isFinite(value) ? value : 0;

const list = (value: unknown): Fields[] =>
  Array.isArray(value) ? value.filter(isFields) : [];

export const parseSetting = (raw: unknown): Setting | null => {
  if (!isFields(raw)) return null;
  const mechanic = isFields(raw.newMechanic) ? raw.newMechanic : {};
  const setting: Setting = {
    name: text(raw.name),
    thesis: text(raw.thesis),
    description: text(raw.description),
    legendaryComponents: list(raw.legendaryComponents).map((component) => ({
      name: text(component.name),
      type: text(component.type),
      description: text(component.description),
    })),
    newMechanic: {
      name: text(mechanic.name),
      description: text(mechanic.description),
      rules_text: text(mechanic.rules_text),
    },
    setArchetypes: list(raw.setArchetypes).map((archetype) => ({
      name: text(archetype.name),
      description: text(archetype.description),
    })),
  };
  return setting.name && setting.thesis ? setting : null;
};

const parseCard = (raw: Fields): CardFace | null => {
  const card: CardFace = {
    name: text(raw.name),
    mana_cost: text(raw.mana_cost),
    art_direction: text(raw.art_direction),
    image_url: null,
    type: text(raw.type),
    subtype: text(raw.subtype),
    rarity: text(raw.rarity),
    rules_text: text(raw.rules_text),
    flavor_text: text(raw.flavor_text),
    power: wholeNumber(raw.power),
    toughness: wholeNumber(raw.toughness),
    set: text(raw.set),
    legendary: raw.legendary === true,
  };
  return card.name && card.type ? card : null;
};

export const parseCards = (raw: unknown): CardFace[] => {
  if (!isFields(raw)) return [];
  return list(raw.cards)
    .map(parseCard)
    .filter((card): card is CardFace => card !== null);
};
