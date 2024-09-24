import { onSnapshot, collection, QuerySnapshot } from "firebase/firestore";
import { useCallback, useEffect } from "react";
import { create } from "zustand";
import { useUser } from "~/hooks/useUser";
import { getCardsInPack } from "~/model/draft";
import { db } from "~/model/firebase";
import { LOBBIES_COLLECTION } from "~/util/constants";
import { Card, Pack } from "~/util/types";

type PacksStore = {
  packs: Pack[];
  setPacks: (packs: Pack[]) => void;
  currentPack: Pack | null;
  setCurrentPack: (pack: Pack | null) => void;
  cards: Card[];
  setCards: (cards: Card[]) => void;
  selectedCard: Card | null;
  setSelectedCard: (card: Card | null) => void;
};

export const usePacksStore = create<PacksStore>((set) => ({
  packs: [],
  setPacks: (packs) => set({ packs }),
  currentPack: null,
  setCurrentPack: (pack) => set({ currentPack: pack }),
  cards: [],
  setCards: (cards) => set({ cards }),
  selectedCard: null,
  setSelectedCard: (card) => set({ selectedCard: card }),
}));

export function usePacks(lobbyId: string) {
  const { user } = useUser();
  const { packs, setPacks, currentPack, setCurrentPack, setCards, setSelectedCard } = usePacksStore();

  useEffect(() => { 
    if(!currentPack) {
      setCards([]);
      setSelectedCard(null);
      return;
    } 
    (async () => {
      const cards = await getCardsInPack(lobbyId, currentPack.id);
      setCards(cards);
    })();
  }, [currentPack, lobbyId, setCards, setSelectedCard]);

  const snapshotHandler = useCallback(async (snapshot: QuerySnapshot) => {
    const packs = snapshot.docs.map((doc) => doc.data() as Pack);
    setPacks(packs);
    // get all the current user's packs
    if (!user) return;
    const userPacks = packs.filter((pack) => pack.currentHolder === user.uid);
    if(userPacks.length === 0) {
      setCurrentPack(null);
      return;
    }
    const lowestPositionPack = userPacks.reduce((a, b) => a.position < b.position ? a : b);
    setCurrentPack(lowestPositionPack);
  }, [user, setPacks, setCurrentPack]);

  useEffect(() => {
    if(!user) return;
    const unsubscribe = onSnapshot(collection(db, LOBBIES_COLLECTION, lobbyId, "packs"), snapshotHandler);
    return unsubscribe;
  }, [lobbyId, setPacks, snapshotHandler, user]);

  return packs;
}
