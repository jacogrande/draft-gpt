import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc
} from "firebase/firestore";
import { db } from "~/model/firebase";
import { Card, Deck } from "~/util/types";

export const getAllDecks = async (userId: string) => {
  const decksRef = collection(db, "users", userId, "decks");
  const querySnapshot = await getDocs(decksRef);
  const decks = querySnapshot.docs.map((doc) => doc.data() as Deck);
  return decks;
};

/**
 * Moves a card from a deck's mainboard to a deck's sideboard
 * @param deckId - the id of the deck to move the card from
 * @param userId - the id of the user to move the card from
 * @param cardId - the id of the card to move
 * @description removes the card from the deck's `cards` field and adds it to the `sideboard` field
 */
export const moveCardToSideboard = async (
  deckId: string,
  userId: string,
  cardId: string
) => {
  const deckRef = doc(db, "users", userId, "decks", deckId);
  const deckDoc = await getDoc(deckRef);
  const deckData = deckDoc.data();
  if (!deckData) throw new Error("Deck not found");
  const { cards, sideboard } = deckData as Deck;
  const cardIndex = cards.findIndex((card) => card.id === cardId);
  if (cardIndex === -1) throw new Error("Card not found");
  const card = cards[cardIndex];
  cards.splice(cardIndex, 1);

  // If the card isn't a basic land, add it to the sideboard
  const newSideboard = sideboard || [];
  if (card.type !== "Basic Land") {
    newSideboard.push(card);
  }
  await updateDoc(deckRef, {
    cards,
    sideboard: newSideboard,
  });
};

export const moveCardToMainboard = async (
  deckId: string,
  userId: string,
  cardId: string
) => {
  const deckRef = doc(db, "users", userId, "decks", deckId);
  const deckDoc = await getDoc(deckRef);
  const deckData = deckDoc.data();
  if (!deckData) throw new Error("Deck not found");
  const { sideboard, cards } = deckData as Deck;
  if (!sideboard) throw new Error("Deck has no sideboard");

  const cardIndex = sideboard.findIndex((card) => card.id === cardId);
  if (cardIndex === -1) throw new Error("Card not found");
  const card = sideboard[cardIndex];
  sideboard.splice(cardIndex, 1);
  const newCards = cards || [];
  newCards.push(card);
  await updateDoc(deckRef, {
    cards: newCards,
    sideboard,
  });
};

export const addBasicLandToMainboard = async (
  deckId: string,
  userId: string,
  card: Card
) => {
  const deckRef = doc(db, "users", userId, "decks", deckId);
  console.log(card);
  await updateDoc(deckRef, {
    cards: arrayUnion(card),
  });
};

export const addManyCardsToDeck = async (
  deckId: string,
  userId: string,
  cards: Card[]
) => {
  const deckRef = doc(db, "users", userId, "decks", deckId);
  await updateDoc(deckRef, {
    cards: arrayUnion(...cards),
  });
};

