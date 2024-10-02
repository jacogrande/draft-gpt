import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "~/model/firebase";
import { logShuffle } from "~/model/loggers";
import shuffleArray from "~/util/shuffleArray";
import { Card, Deck } from "~/util/types";


/**
 * Util function to get the game ref and deck data
 * @param gameId - the id of the current game
 * @param userId - the id of the user to get the deck for
 * @returns an object containing the game ref and deck data
 */
export const getGameAndDeck = async (gameId: string, userId: string) => {
  const gameRef = doc(db, "games", gameId);
  const gameDoc = await getDoc(gameRef);
  if (!gameDoc.exists()) throw new Error("Game not found");
  const deck = gameDoc.data().decks[userId];
  if (!deck) throw new Error("Deck not found");
  return { gameRef, game: gameDoc.data(), deck };
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
  const shuffledCards = shuffleArray<Card>(deck.cards);
  const newDeck = {
    ...deck,
    cards: shuffledCards,
  };
  await setDoc(
    gameRef,
    {
      readyMap: {
        [userId]: true,
      },
      decks: {
        [userId]: newDeck,
      },
    },
    { merge: true }
  );
};

/**
 * Shuffles a player's deck
 * @param gameId - the id of the current game
 * @param userId - the id of the user to shuffle their deck for
 * @returns a promise that resolves when the deck is shuffled
 */
export const shuffleDeck = async (gameId: string, userId: string): Promise<void> => {
  const { gameRef, deck } = await getGameAndDeck(gameId, userId);
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
  const { gameRef, game } = await getGameAndDeck(gameId, userId);
  const hand = game.decks[userId].hand || [];
  for (let i = 0; i < amount; i++) {
    if (i >= deck.cards.length) return false;
    const card = deck.cards.shift();
    if (card) card.zone = "hand";
    hand.push(card);
  }
  await setDoc(
    gameRef,
    {
      decks: {
        [userId]: {
          ...deck,
          hand,
        },
      },
    },
    { merge: true }
  );
  return true;
};


