import { collection, doc, getDoc, getDocs, runTransaction } from "firebase/firestore";
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
    if(lobbyData.draftStarted) return false;

    if (!lobbyData.draftStarted) {
      transaction.update(lobbyRef, { currentRound: 1, draftStarted: true });
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

const createSetting = async (lobbyId: string) => {
  const worldbuildingMessages = (await getWorldbuildingMessages(lobbyId)).map((message) => message.message);
  await fetch("/api/createSetting", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      lobbyId,
      worldbuildingMessages,
    }),
  });
};

const getWorldbuildingMessages = async (lobbyId: string): Promise<WorldbuildingMessage[]> => {
  const lobbyRef = doc(db, LOBBIES_COLLECTION, lobbyId);
  const lobbyDoc = await getDoc(lobbyRef);
  const lobbyData = lobbyDoc.data();
  if (!lobbyData) throw new Error("Lobby not found");
  return lobbyData.worldbuildingMessages as WorldbuildingMessage[] || [];
};

const runPackDistributionManager= async (lobbyId: string, round: number) => {
  const userIds = await getLobbyUserIdList(lobbyId);
  const packOrders = createPackDraftOrders(userIds);
  const packPromises: Promise<void>[] = [];
  for(const draftOrder of packOrders) {
    packPromises.push(createPack(lobbyId, draftOrder, round));
    await sleep(500); // avoid rate limiting
  }
  await Promise.all(packPromises); // TODO: Use Promise.allSettled
  // ensure each pack has at least 15 cards
  await finishPacks(lobbyId);
};

const createPack = async (lobbyId: string, draftOrder: string[], round: number): Promise<void> => {
  const response = await fetch("/api/createPack", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      lobbyId,
      draftOrder,
      round
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

export const getCardsInPack = async (lobbyId: string, packId: string): Promise<Card[]> => {
  const cardsRef = collection(db, LOBBIES_COLLECTION, lobbyId, "packs", packId, "cards");
  const querySnapshot = await getDocs(cardsRef);
  const cards = querySnapshot.docs.map((doc) => doc.data() as Card);
  return cards;
};
