import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  Timestamp,
  where
} from "firebase/firestore";
import { db } from "~/model/firebase";
import { logShuffle } from "~/model/loggers";
import { REQUIRED_PLAYERS_FOR_GAME, STARTING_LIFE } from "~/util/constants";
import shuffleArray from "~/util/shuffleArray";
import { Card, Deck, Game, User } from "~/util/types";

export const createGame = async (name: string, user: User) => {
  const gamesRef = collection(db, "games");
  const gameDoc = doc(gamesRef);
  const newGame: Game = {
    id: gameDoc.id,
    name,
    createdAt: Timestamp.now(),
    activeUsers: [{ username: user.username, uid: user.uid }],
    createdBy: user.uid,
    readyMap: {},
    decks: {},
    lifeTotals: {},
  };
  await setDoc(gameDoc, newGame);
  return gameDoc.id;
};

export const joinGame = async (
  user: User,
  gameId: string
): Promise<boolean> => {
  const gameRef = doc(db, "games", gameId);
  const gameData = await getDoc(gameRef);
  if (!gameData.exists()) throw new Error("Game not found");
  const game = gameData.data() as Game;
  const userCount = game.activeUsers.filter(
    (user) => user.uid !== user.uid
  ).length; // filter out the current user
  const newLifeTotal = game.lifeTotals[user.uid] || STARTING_LIFE;
  if (userCount >= REQUIRED_PLAYERS_FOR_GAME) return false;
  await setDoc(
    gameRef,
    {
      activeUsers: arrayUnion({ username: user.username, uid: user.uid }),
      lifeTotals: { [user.uid]: newLifeTotal },
    },
    { merge: true }
  );
  return true;
};

export const getGameByName = async (name: string) => {
  const gamesRef = collection(db, "games");
  const querySnapshot = query(gamesRef, where("name", "==", name));
  const docs = await getDocs(querySnapshot);
  const game = docs.docs[0];
  if (!game) return null;
  return game.data() as Game;
};

/**
 * Readies a player up by writing their deck to the game document
 * @param gameId - the id of the game to ready up
 * @param userId - the id of the user to ready up
 * @param deck - the deck to ready up with
 * @returns a promise that resolves when the ready up is complete
 */
export const submitDeck = async (
  gameId: string,
  userId: string,
  deck: Deck
): Promise<void> => {
  const gameRef = doc(db, "games", gameId);
  const gameDoc = await getDoc(gameRef);
  if (!gameDoc.exists()) throw new Error("Game not found");
  await setDoc(
    gameRef,
    {
      readyMap: {
        [userId]: true,
      },
      decks: {
        [userId]: deck,
      },
    },
    { merge: true }
  );
};

export const updateLifeTotal = async (
  gameId: string,
  userId: string,
  lifeTotal: number
): Promise<void> => {
  const gameRef = doc(db, "games", gameId);
  const gameDoc = await getDoc(gameRef);
  if (!gameDoc.exists()) throw new Error("Game not found");
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

export const shuffleDeck = async (gameId: string, userId: string) => {
  const gameRef = doc(db, "games", gameId);
  const gameDoc = await getDoc(gameRef);
  if (!gameDoc.exists()) throw new Error("Game not found");
  const deck = gameDoc.data().decks[userId];
  if (!deck) throw new Error("Deck not found");
  const shuffledCards = shuffleArray<Card>(deck.cards);
  await setDoc(
    gameRef,
    {
      decks: {
        [userId]: {
          ...deck,
          cards: shuffledCards,
        },
      },
    },
    { merge: true }
  );
  await logShuffle(gameId, userId);
};

/**
 * Draws a card from the deck
 * @param gameId - the id of the game to draw the card from
 * @param deck - the deck to draw the card from
 * @param userId - the id of the user to draw the card from
 * @param amount - the amount of cards to draw
 * @returns a promise that resolves to true if the draw was successful, false if there weren't enough cards to draw
 */
export const drawCards = async (
  gameId: string,
  deck: Deck,
  userId: string,
  amount: number
): Promise<boolean> => {
  const gameRef = doc(db, "games", gameId);
  const gameDoc = await getDoc(gameRef);
  if (!gameDoc.exists()) throw new Error("Game not found");
  const hand = gameDoc.data().decks[userId].hand || [];
  for (let i = 0; i < amount; i++) {
    if (i >= deck.cards.length) return false;
    const card = deck.cards.shift();
    hand.push(card);
  }
  await setDoc(gameRef, {
    decks: {
      [userId]: {
        ...deck,
        hand
      },
    },
  }, {merge: true});
  return true;
};
