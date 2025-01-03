import { Timestamp } from "firebase/firestore";
import { GeneratedCard, Setting } from "~/.server/prompts/responseTypes";

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
}

export type PublicUser = {
  username: string;
  uid: string;
}

export type WorldbuildingMessage = {
  message: string;
  posterId: string;
  timestamp: Timestamp;
}

export type Lobby = {
  id: string;
  name: string;
  creatingPacks: boolean;
  createdBy: string;
  activeUsers: PublicUser[];
  createdAt: Timestamp;
  activityMap: Record<string, Timestamp>;
  draftStarted?: boolean;
  readyMap?: Record<string, boolean>;
  setting?: string; // setting id
  lastActive: Timestamp;
  worldbuildingMessages?: WorldbuildingMessage[];
  currentRound: number;
};

export type Pack = {
  id: string;
  currentHolder: string;
  order: string[];
  position: number;
  lobbyId: string;
  cardCount: number;
  round: number;
}

export type SettingWithMetadata = Setting & {
  lobbyId: string;
  id: string;
  icon: string;
  createdAt: string;
  createdBy: string;
}

export type Card = GeneratedCard & {
  id: string;
  packId: string;
  zone?: CardZone;
  createdAt: Timestamp;
  pickedBy: string;
  tapped?: boolean;
}

export type CardColor = "red" | "white" | "blue" | "black" | "green" | "multi" | "colorless";

export type CardZone = "deck" | "hand" | "battlefield" | "graveyard";

export type Deck = {
  id: string;
  lobbyId: string;
  name: string;
  cards: Card[];
  sideboard?: Card[];
  hand?: Card[];
  graveyard?: Card[];
  battlefield?: Card[];
  createdAt: Timestamp;
  createdBy: string;
}

export type BasicLand = "plains" | "forest" | "mountain" | "swamp" | "island";

export type InteractionLog = {
  uid: string;
  message: string;
  timestamp: Timestamp;
  targetCard?: string;
}

export type Counter = {
  id: string;
  ownerId: string;
  value: string;
  color: string;
  position: {x: number, y: number}; // position of the counter in the player's game field
  // NOTE: When displaying opponent counters, we'll need to invert the y axis since their board is flipped
}

export type Token = {
  id: string;
  ownerId: string;
  name: string;
  power: number | null;
  toughness: number | null;
  tapped?: boolean;
}

export type Game = {
  id: string;
  name: string;
  createdAt: Timestamp;
  createdBy: string;
  activeUsers: PublicUser[];
  lifeTotals: Record<string, number>; // user id -> life total
  decks: Record<string, Deck>;
  readyMap: Record<string, boolean>;
  log?: InteractionLog[];
  counters?: Counter[];
  tokens?: Token[];
}
