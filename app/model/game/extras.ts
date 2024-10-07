//========= COUNTERS =========//

import { arrayUnion, doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "~/model/firebase";
import { randomUid } from "~/util/randomUid";
import { Counter } from "~/util/types";

/**
 * Creates a new counter in the game
 * @param gameId - the id of the game to create the counter for
 * @param userId - the id of the user to create the counter for
 * @param position - the position of the counter in the player's game field
 * @param color - the background color of the counter
 * @returns the id of the created counter
 */
export const createCounter = async (
  gameId: string,
  userId: string,
  position: {x: number, y: number},
  color: string,
): Promise<string> => {
  const gameRef = doc(db, "games", gameId);
  const counter: Counter = {
    id: randomUid(),
    ownerId: userId,
    color,
    value: "0",
    position,
  };
  await setDoc(gameRef, {
    counters: arrayUnion(counter),
  }, { merge: true });
  return counter.id;
};

/**
 * Updates the value of a counter
 * @param gameId - the id of the game to update the counter for 
 * @param counterId - the id of the counter to update
 * @param value - the new value of the counter
 */
export const updateCounterValue = async (
  gameId: string,
  counterId: string,
  value: string
) => {
  const gameRef = doc(db, "games", gameId);
  const gameData = await getDoc(gameRef);
  if (!gameData.exists()) throw new Error("Game not found");
  const counters = gameData.data().counters || [];
  for (const counter of counters) {
    if (counter.id === counterId) {
      counter.value = value;
      await setDoc(gameRef, {
        counters,
      }, { merge: true });
      return;
    }
  }
};

//========= TOKENS =========//
