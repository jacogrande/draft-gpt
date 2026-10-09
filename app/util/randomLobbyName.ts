import { ADJECTIVES, NOUNS } from "~/util/constants";
import { getRandomElement } from "~/util/getRandomElement";

export const randomLobbyName = (): string =>
  `${getRandomElement(ADJECTIVES)}-${getRandomElement(NOUNS)}`.toLowerCase();
