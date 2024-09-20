import { Timestamp } from "firebase-admin/firestore";
import { adminDb } from "~/.server/firebase-admin";
import { GeneratedCard, Setting } from "~/.server/prompts/responseTypes";
import { SET_ICONS } from "~/util/constants";
import { randomUid } from "~/.server/util/randomUid";
import { Pack } from "~/util/types";

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
      createdAt: Timestamp.now(),
      pickedBy: null,
    };
    batch.create(packRef.collection("cards").doc(id), cardData);
  });
  await batch.commit();
  console.log("cards added to pack");
};
