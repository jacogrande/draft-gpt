//========= COUNTERS =========//

import { arrayUnion, doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "~/model/firebase";
import { randomUid } from "~/util/randomUid";
import { Counter, Token } from "~/util/types";

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

/**
 * Updates the position of a counter
 * @param gameId - the id of the game to update the counter for 
 * @param counterId - the id of the counter to update
 * @param position - the new position of the counter
 */
export const updateCounterPosition = async (
  gameId: string,
  counterId: string,
  position: {x: number, y: number}
) => {
  const gameRef = doc(db, "games", gameId);
  const gameData = await getDoc(gameRef);
  if (!gameData.exists()) throw new Error("Game not found");
  const counters = gameData.data().counters || [];
  for (const counter of counters) {
    if (counter.id === counterId) {
      counter.position = position;
      await setDoc(gameRef, {
        counters,
      }, { merge: true });
      return;
    }
  }
};

/**
 * Deletes a counter in a game
 * @param gameId - the id of the game to delete the counter from
 * @param counterId - the id of the counter to delete
 */
export const deleteCounter = async (
  gameId: string,
  counterId: string
): Promise<void> => {
  const gameRef = doc(db, "games", gameId);
  const gameData = await getDoc(gameRef);
  if (!gameData.exists()) throw new Error("Game not found");
  const counters = gameData.data().counters || [];
  // remove the counter from the array
  const newCounters = counters.filter((counter: Counter) => counter.id !== counterId);
  await setDoc(gameRef, {
    counters: newCounters,
  }, { merge: true });
};

//========= TOKENS =========//
/**
 * Creates a new token in the game
 * @param gameId - the id of the game to create the token for
 * @param userId - the id of the user to create the token for
 * @param name - the name of the token
 * @param power - the power of the token
 * @param toughness - the toughness of the token
 * @returns the id of the created token
 */
export const createToken = async (
  gameId: string,
  userId: string,
  name: string,
  power: number | null,
  toughness: number | null
): Promise<string> => {
  const gameRef = doc(db, "games", gameId);
  const token: Token = {
    id: randomUid(),
    ownerId: userId,
    name,
    power,
    toughness,
  };
  await setDoc(gameRef, {
    tokens: arrayUnion(token),
  }, { merge: true });
  return token.id;
};

/**
 * Deletes a token from the game
 * @param gameId - the id of the game to delete the token from
 * @param tokenId - the id of the token to delete
 */
export const deleteToken = async (
  gameId: string,
  tokenId: string
): Promise<void> => {
  const gameRef = doc(db, "games", gameId);
  const gameData = await getDoc(gameRef);
  if (!gameData.exists()) throw new Error("Game not found");
  const tokens = gameData.data().tokens || [];
  // remove the token from the array
  const newTokens = tokens.filter((token: Token) => token.id !== tokenId);
  await setDoc(gameRef, {
    tokens: newTokens,
  }, { merge: true });
};

/**
 * Taps or untaps a token
 * @param gameId - the id of the game to tap the token for
 * @param tokenId - the id of the token to tap
 * @param tap - whether to tap or untap the token
 */
export const tapToken = async (
  gameId: string,
  tokenId: string,
  tap: boolean = true
) => {
  const gameRef = doc(db, "games", gameId);
  const gameData = await getDoc(gameRef);
  if (!gameData.exists()) throw new Error("Game not found");
  const tokens = gameData.data().tokens || [];
  for (const token of tokens) {
    if (token.id === tokenId) {
      token.tapped = tap;
      console.log(token);
      await setDoc(gameRef, {
        tokens,
      }, { merge: true });
      return;
    }
  }
};

