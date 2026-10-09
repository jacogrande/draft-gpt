import { Infer, v } from "convex/values";

export const cardFace = {
  name: v.string(),
  mana_cost: v.string(),
  art_direction: v.string(),
  image_url: v.union(v.string(), v.null()),
  type: v.string(),
  subtype: v.string(),
  rarity: v.string(),
  rules_text: v.string(),
  flavor_text: v.string(),
  power: v.number(),
  toughness: v.number(),
  set: v.string(),
  legendary: v.boolean(),
};

const cardFaceObject = v.object(cardFace);

export type CardFace = Infer<typeof cardFaceObject>;

export const pickFace = (source: CardFace): CardFace => ({
  name: source.name,
  mana_cost: source.mana_cost,
  art_direction: source.art_direction,
  image_url: source.image_url,
  type: source.type,
  subtype: source.subtype,
  rarity: source.rarity,
  rules_text: source.rules_text,
  flavor_text: source.flavor_text,
  power: source.power,
  toughness: source.toughness,
  set: source.set,
  legendary: source.legendary,
});
