//========= SETTING =========//

export type Setting = {
  name: string;
  thesis: string;
  description: string;
  legendaryComponents: LegendaryComponent[];
  newMechanic: Mechanic;
  setSynergies: Mechanic[];
};

type LegendaryComponent = {
  name: string;
  type: string;
  description: string;
};

type Mechanic = {
  name: string;
  description: string;
  rules_text: string;
};

//========= PACK =========//

export type GeneratedCard = {
  name: string;
  mana_cost: string;
  type: string;
  subtype: string;
  rarity: string;
  rules_text: string;
  flavor_text: string;
  power: number;
  toughness: number;
  set: string;
  legendary: boolean;
};

export type PackResponse = {
  cards: GeneratedCard[];
};

//========= TYPE GUARDS =========//

export const isSetting = (setting: unknown): setting is Setting => {
  return (
    typeof setting === "object" &&
    setting !== null &&
    "name" in setting &&
    "thesis" in setting &&
    "description" in setting &&
    "legendaryComponents" in setting &&
    "newMechanic" in setting &&
    "setSynergies" in setting
  );
};

export const isCard = (card: unknown): card is GeneratedCard => {
  return (
    typeof card === "object" &&
    card !== null &&
    "name" in card &&
    "mana_cost" in card &&
    "type" in card &&
    "subtype" in card &&
    "rarity" in card &&
    "rules_text" in card &&
    "flavor_text" in card &&
    "power" in card &&
    "toughness" in card &&
    "set" in card &&
    "legendary" in card
  );
};

export const isPackResponse = (
  packResponse: unknown
): packResponse is PackResponse => {
  return (
    typeof packResponse === "object" &&
    packResponse !== null &&
    "cards" in packResponse &&
    Array.isArray(packResponse.cards) &&
    packResponse.cards.every((card) => isCard(card))
  );
};
