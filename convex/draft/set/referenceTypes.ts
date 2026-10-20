import { Color, Rarity, Slot } from "./types";

export type PowerReference = {
  id: string;
  name: string;
  rarity: Rarity;
  type: Slot["type"];
  typeLine: string;
  power: string | null;
  toughness: string | null;
  band: "target" | "too_weak" | "too_strong" | "combo_warning";
  mana: string;
  value: number;
  colors: Color[];
  role: string;
  effect: string;
  rationale: string;
  context: string;
  scope: string;
  source: string;
};
