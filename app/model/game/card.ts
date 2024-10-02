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

/**
 * Taps/untaps multiple cards for a user in a game.
 * @param gameId - The ID of the game.
 * @param userId - The ID of the user.
 * @param cardIds - An array of card IDs to tap/untap.
 * @returns A promise that resolves to true if the operation is successful, false otherwise.
 */
export const tapManyCards = async (
  gameId: string,
  userId: string,
  cardIds: string[]
): Promise<boolean> => {
  const { gameRef, deck } = await getGameAndDeck(gameId, userId);
  if (!deck.battlefield || deck.battlefield.length === 0) {
    console.warn(`No cards on the battlefield for user ${userId}`);
    return false;
  }

  let success = false;
  for (const cardId of cardIds) {
    const card = deck.battlefield.find((card: Card) => card.id === cardId);
    if (!card) {
      console.warn(`Card ${cardId} not found on the battlefield for user ${userId}`);
      continue; // Skip to the next card ID
    }

    card.tapped = !card.tapped;
    if (card.tapped) {
      logTap(gameId, userId, cardId);
    } else {
      logUntap(gameId, userId, cardId);
    }
    success = true; // At least one card was successfully toggled
  }
  if (!success) {
    return false;
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
