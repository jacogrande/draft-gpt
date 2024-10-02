import { setDoc } from "firebase/firestore";
import { getGameAndDeck } from "~/model/game/deck";
import { logTap, logUntap } from "~/model/loggers";
import { Card } from "~/util/types";

/**
 * Taps/untaps a card
 * @param gameId - the id of the current game
 * @param userId - the id of the user to tap the card for
 * @param cardId - the id of the card to tap
 * @returns a promise that resolves to true if the tap was successful, false otherwise
 */
export const tapCard = async (
  gameId: string,
  userId: string,
  cardId: string
): Promise<boolean> => {
  const { gameRef, deck } = await getGameAndDeck(gameId, userId);
  const card = deck.battlefield?.find((card: Card) => card.id === cardId);
  if (!card) return false;
  card.tapped = !card.tapped;
  if (card.tapped) {
    logTap(gameId, userId, cardId);
  } else {
    logUntap(gameId, userId, cardId);
  }
  await setDoc(
    gameRef,
    {
      decks: {
        [userId]: {
          ...deck,
        },
      },
    },
    { merge: true }
  );
  return true;
};
