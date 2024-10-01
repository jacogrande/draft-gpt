import { Game } from "~/util/types";

export const getCardNameFromGame = (cardId: string, game: Game) => {
  for (const deck of Object.values(game.decks)) {
    for (const card of deck.battlefield || []) {
      if (card.id === cardId) {
        return card.name;
      }
    }
    for (const card of deck.hand || []) {
      if (card.id === cardId) {
        return card.name;
      }
    }
    for (const card of deck.graveyard || []) {
      if (card.id === cardId) {
        return card.name;
      }
    }
    for (const card of deck.cards || []) {
      if (card.id === cardId) {
        return card.name;
      }
    }
  }
};
