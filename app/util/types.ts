export type DaisyColor =
  | "primary"
  | "primary-content"
  | "secondary"
  | "secondary-content"
  | "accent"
  | "accent-content"
  | "neutral"
  | "neutral-content"
  | "base-100"
  | "base-200"
  | "base-300"
  | "base-content"
  | "info"
  | "info-content"
  | "success"
  | "success-content"
  | "warning"
  | "warning-content"
  | "error"
  | "error-content";

export type User = {
  uid: string;
  email: string;
  username: string;
};

export type Card = {
  id: string;
  name: string;
  mana_cost: string;
  art_direction: string;
  image_url?: string | null;
  type: string;
  subtype: string;
  rarity: string;
  rules_text: string;
  flavor_text: string;
  power: number;
  toughness: number;
  set: string;
  legendary: boolean;
  tapped?: boolean;
};

export type CardColor = "red" | "white" | "blue" | "black" | "green" | "multi" | "colorless";

export type Deck = {
  id: string;
  lobbyId: string;
  name: string;
  cards: Card[];
  sideboard?: Card[];
  createdAt: number;
};

export type BasicLand = "plains" | "forest" | "mountain" | "swamp" | "island";
