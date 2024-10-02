import {
  setDoc
} from "firebase/firestore";
import { getGameAndDeck } from "~/model/game/deck";


/**
 * Updates a player's life total
 * @param gameId - the id of the current game
 * @param userId - the id of the user to update the life total for
 * @param lifeTotal - the new life total
 * @returns a promise that resolves when the life total is updated
 */
export const updateLifeTotal = async (
  gameId: string,
  userId: string,
  lifeTotal: number
): Promise<void> => {
  const { gameRef } = await getGameAndDeck(gameId, userId);
  await setDoc(
    gameRef,
    {
      lifeTotals: {
        [userId]: lifeTotal,
      },
    },
    { merge: true }
  );
};



