import { Timestamp } from "firebase-admin/firestore";
import { adminDb } from "~/.server/firebase-admin";
import { GeneratedCard, Setting } from "~/.server/prompts/responseTypes";
import { SET_ICONS } from "~/util/constants";
import { randomUid } from "~/util/randomUid";
import { Card, Pack } from "~/util/types";

type CreateSettingDocParams = {
  lobbyId: string;
  userId: string;
  setting: Setting;
};

/**
 * Creates a new setting document in the database
 * @param lobbyId - the id of the lobby to create the setting for
 * @param userId - the id of the user creating the setting
 * @param setting - the setting data to create the document with
 * @return
 */
export const createSettingDoc = async ({
  lobbyId,
  userId,
  setting,
}: CreateSettingDocParams): Promise<string> => {
  const randomIcon = SET_ICONS[Math.floor(Math.random() * SET_ICONS.length)];
  const addedDoc = await adminDb.collection("settings").add({
    lobbyId,
    createdAt: Timestamp.now(),
    icon: randomIcon,
    ...setting,
    createdBy: userId,
  });
  // return the id of the created document
  return addedDoc.id;
};

/**
 * Creates a new pack document in the database
 * @param lobbyId - the id of the lobby to create the pack for
 * @param draftOrder - the order of the pack's cards
 * @param round - the round the pack is being created for
 * @returns a promise that resolves to the id of the created pack document
 */
export const createPackDoc = async (
  lobbyId: string,
  draftOrder: string[],
  round: number
): Promise<string> => {
  const packRef = adminDb
    .collection("lobbies")
    .doc(lobbyId)
    .collection("packs")
    .doc();
  const pack: Pack = {
    currentHolder: draftOrder[0],
    order: draftOrder,
    position: 0,
    cardCount: 0,
    lobbyId,
    round,
    id: packRef.id,
  };
  await packRef.set(pack);
  return packRef.id;
};

/**
 * Adds card data to a pack
 * @param packId - the id of the pack to add the cards to
 * @param lobbyId - the id of the lobby the pack belongs to
 * @param cards - the cards to add to the pack
 * @returns a promise that resolves when the cards have been added to the pack
 * @description this will populate the pack's `cards` subcollection with a card doc for each card in the `cards` array
 */
export const addCardsToPack = async (
  packId: string,
  lobbyId: string,
  cards: GeneratedCard[]
): Promise<void> => {
  const packRef = adminDb.collection(`lobbies/${lobbyId}/packs`).doc(packId);
  const batch = adminDb.batch();
  cards.forEach(async (card) => {
    const id = randomUid();
    const cardData = {
      ...card,
      id,
      packId,
      createdAt: Timestamp.now(),
      pickedBy: null,
    };
    batch.create(packRef.collection("cards").doc(id), cardData);
  });
  const existingPackData = await packRef.get();
  const existingCardCount = existingPackData.data()?.cardCount || 0;
  await packRef.set(
    { cardCount: existingCardCount + cards.length },
    { merge: true }
  );
  await batch.commit();
  console.log("cards added to pack");
};

/**
 * Adds card data to a setting
 * @param settingId - the id of the setting to add the cards to
 * @param lobbyId - the id of the lobby the setting belongs to
 * @param cards - the cards to add to the setting
 * @returns a promise that resolves when the cards have been added to the setting
 * @description this will populate the setting's `cards` subcollection with a card doc for each card in the `cards` array
 */
export const addCardsToSetting = async (
  settingId: string,
  lobbyId: string,
  cards: GeneratedCard[]
): Promise<void> => {
  const settingRef = adminDb.collection(`settings`).doc(settingId);
  const batch = adminDb.batch();
  cards.forEach(async (card) => {
    const id = randomUid();
    const cardData = {
      ...card,
      id,
      lobbyId,
      createdAt: Timestamp.now(),
    };
    batch.create(settingRef.collection("cards").doc(id), cardData);
  });
  await batch.commit();
};

export const getAllPacksInLobby = async (lobbyId: string): Promise<Pack[]> => {
  const packsRef = adminDb.collection(`lobbies/${lobbyId}/packs`);
  const packs = await packsRef.get();
  return packs.docs.map((doc) => doc.data() as Pack);
};

export const getAllSettingCards = async (
  settingId: string
): Promise<Card[]> => {
  const cardsRef = adminDb.collection(`settings/${settingId}/cards`);
  const cards = await cardsRef.get();
  return cards.docs.map((doc) => doc.data() as Card);
};
