import {
  arrayUnion,
  collection,
  doc,
  DocumentData,
  DocumentReference,
  getDoc,
  getDocs,
  runTransaction,
  setDoc,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { sleep } from "openai/core.mjs";
import { db } from "~/model/firebase";
import { getLobbyUserIdList } from "~/model/lobby";
import { LOBBIES_COLLECTION } from "~/util/constants";
import { createPackDraftOrders } from "~/util/createPackDraftOrders";
import { Card, WorldbuildingMessage } from "~/util/types";

export const startDraft = async (lobbyId: string) => {
  const lobbyRef = doc(db, LOBBIES_COLLECTION, lobbyId);
  const isInitiator = await runTransaction(db, async (transaction) => {
    const lobbyDoc = await transaction.get(lobbyRef);
    const lobbyData = lobbyDoc.data();
    if (!lobbyData) throw new Error("Lobby not found");
    if (lobbyData.draftStarted || lobbyData.creatingPacks) return false;

    if (!lobbyData.draftStarted) {
      transaction.update(lobbyRef, { currentRound: 1, draftStarted: true, creatingPacks: true });
      // The client that successfully sets draftStarted to true proceeds to generate packs.
      return true;
    } else {
      // Another client has already started the draft
      return false;
    }
  });
  if (isInitiator) {
    // This client will generate the first round of packs
    await createSetting(lobbyId);
    await runPackDistributionManager(lobbyId, 1);
  }
};

export const nextRound = async (lobbyId: string, round: number) => {
  const lobbyRef = doc(db, LOBBIES_COLLECTION, lobbyId);
  const isInitiator = await runTransaction(db, async (transaction) => {
    const lobbyDoc = await transaction.get(lobbyRef);
    const lobbyData = lobbyDoc.data();
    if (!lobbyData) throw new Error("Lobby not found");
    if (lobbyData.creatingPacks) return false;

    if (lobbyData.currentRound !== round && !lobbyData.creatingPacks) {
      transaction.update(lobbyRef, {currentRound: round, creatingPacks: true});
      return true; // this client will generate the packs for the next round
    } else {
      return false; // another client has already started generating packs for this round
    }
  });
  if (isInitiator) {
    await runPackDistributionManager(lobbyId, round);
  }
}

const createSetting = async (lobbyId: string) => {
  const worldbuildingMessages = (await getWorldbuildingMessages(lobbyId)).map(
    (message) => message.message
  );
  const response = await fetch("/api/createSetting", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      lobbyId,
      worldbuildingMessages,
    }),
  });
  if(!response.ok) throw new Error("Setting generation failed");
};

const getWorldbuildingMessages = async (
  lobbyId: string
): Promise<WorldbuildingMessage[]> => {
  const lobbyRef = doc(db, LOBBIES_COLLECTION, lobbyId);
  const lobbyDoc = await getDoc(lobbyRef);
  const lobbyData = lobbyDoc.data();
  if (!lobbyData) throw new Error("Lobby not found");
  return (lobbyData.worldbuildingMessages as WorldbuildingMessage[]) || [];
};

const runPackDistributionManager = async (lobbyId: string, round: number) => {
  const userIds = await getLobbyUserIdList(lobbyId);
  const packOrders = createPackDraftOrders(userIds);
  const packPromises: Promise<void>[] = [];
  for (const draftOrder of packOrders) {
    packPromises.push(createPack(lobbyId, draftOrder, round));
    await sleep(500); // avoid rate limiting
  }
  await Promise.all(packPromises); // TODO: Use Promise.allSettled
  // ensure each pack has at least 15 cards
  await finishPacks(lobbyId);
};

const createPack = async (
  lobbyId: string,
  draftOrder: string[],
  round: number
): Promise<void> => {
  const response = await fetch("/api/createPack", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      lobbyId,
      draftOrder,
      round,
    }),
  });
  const json = await response.json();
  console.log(json);
};

const finishPacks = async (lobbyId: string) => {
  const response = await fetch("/api/finishPacks", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      lobbyId,
    }),
  });
  const json = await response.json();
  console.log(json);
};

/**
 * Gets all the cards in a pack
 * @param lobbyId - the id of the lobby to get the cards from
 * @param packId - the id of the pack to get the cards from
 * @returns an array of cards in the pack
 */
export const getCardsInPack = async (
  lobbyId: string,
  packId: string
): Promise<Card[]> => {
  const cardsRef = collection(
    db,
    LOBBIES_COLLECTION,
    lobbyId,
    "packs",
    packId,
    "cards"
  );
  const querySnapshot = await getDocs(cardsRef);
  const cards = querySnapshot.docs
    .map((doc) => doc.data() as Card)
    .filter((card) => !card.pickedBy);
  return cards;
};

/**
 * Picks a card from a pack
 * @param lobbyId - the id of the lobby to pick the card from
 * @param packId - the id of the pack to pick the card from
 * @param userId - the id of the user picking the card
 * @param cardId - the id of the card to pick
 * @description this will manage all the card picking side effects, including
 *              updating the pack's `currentHolder` field
 *              adding the picked card to the user's deck (creating the deck if it doesn't exist)
 *              this will also update the card's `pickedBy` field
 */
export const pickCard = async (
  lobbyId: string,
  packId: string,
  userId: string,
  cardId: string
): Promise<void> => {
  await movePackToNextUser(lobbyId, packId);
  const card = await markCardAsPicked(lobbyId, packId, userId, cardId);
  await addCardToDeck(lobbyId, userId, card);
};

/**
 * Moves a pack to the next user in the draft order
 * @param lobbyId - the id of the lobby to move the pack to
 * @param packId - the id of the pack to move
 * @description this will update the pack's `currentHolder` field and `position` field
 *              the currentHolder will loop back to the first user in the draft order if it reaches the end
 *              until the position gets to the card count of the pack (15)
 */
const movePackToNextUser = async (lobbyId: string, packId: string) => {
  const packRef = doc(db, LOBBIES_COLLECTION, lobbyId, "packs", packId);
  const packDoc = await getDoc(packRef);
  const packData = packDoc.data();
  if (!packData) throw new Error("Pack not found");
  const { order, position } = packData;
  const nextPosition = position + 1;
  if (nextPosition >= packData.cardCount) {
    await updateDoc(packRef, {
      currentHolder: null,
      position: nextPosition,
    });
  } else {
    const nextUserId = order[nextPosition % order.length] || null;
    await updateDoc(packRef, {
      currentHolder: nextUserId,
      position: nextPosition,
    });
  }
};

/**
 * Marks a card as picked in a pack
 * @param lobbyId - the id of the lobby to mark the card as picked in
 * @param packId - the id of the pack to mark the card as picked in
 * @param userId - the id of the user marking the card as picked
 * @param cardId - the id of the card to mark as picked
 * @description this will update the card's `pickedBy` field
 */
const markCardAsPicked = async (
  lobbyId: string,
  packId: string,
  userId: string,
  cardId: string
): Promise<Card> => {
  const cardRef = doc(
    db,
    LOBBIES_COLLECTION,
    lobbyId,
    "packs",
    packId,
    "cards",
    cardId
  );
  const cardDoc = await getDoc(cardRef);
  const cardData = cardDoc.data();
  if (!cardData) throw new Error("Card not found");
  const { pickedBy } = cardData;
  if (pickedBy) throw new Error("Card is not picked by user"); // card is not picked by user
  await updateDoc(cardRef, {
    pickedBy: userId,
  });
  return cardData as Card;
};

/**
 * Adds a card to a user's deck (creating the deck if it doesn't exist)
 * @param lobbyId - the id of the lobby to add the card to
 * @param userId - the id of the user to add the card to
 * @param card - the card to add to the deck
 */
const addCardToDeck = async (lobbyId: string, userId: string, card: Card) => {
  const deckRef = await getDeckRef(userId, lobbyId);
  const deckDoc = await getDoc(deckRef);
  const deckData = deckDoc.data();
  if (!deckData) throw new Error("Deck not found");
  await updateDoc(deckRef, {
    cards: arrayUnion(card),
  });
};

/**
 * Gets the user's deck doc ref, or creates it if it doesn't exist
 * @param userId - the id of the user to get the deck for
 * @param lobbyId - the id of the lobby to get the deck for
 * @returns the user's deck doc ref
 */
const getDeckRef = async (
  userId: string,
  lobbyId: string
): Promise<DocumentReference<DocumentData>> => {
  const deckRef = doc(db, "users", userId, "decks", lobbyId);
  const deckDoc = await getDoc(deckRef);
  if (!deckDoc.exists()) {
    await setDoc(deckRef, {
      cards: [],
      id: deckRef.id,
      lobbyId,
      createdAt: Timestamp.now(),
      createdBy: userId,
    });
  }
  return deckRef;
};
