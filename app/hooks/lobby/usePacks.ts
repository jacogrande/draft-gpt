import { onSnapshot, collection } from "firebase/firestore";
import { useEffect } from "react";
import { create } from "zustand";
import { db } from "~/model/firebase";
import { LOBBIES_COLLECTION } from "~/util/constants";
import { Pack } from "~/util/types";

type PacksStore = {
  packs: Pack[];
  setPacks: (packs: Pack[]) => void;
};

export const usePacksStore = create<PacksStore>((set) => ({
  packs: [],
  setPacks: (packs) => set({ packs }),
}));

export function usePacks(lobbyId: string) {
  const { packs, setPacks } = usePacksStore();

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, LOBBIES_COLLECTION, lobbyId, "packs"), (snapshot) => {
      const packs = snapshot.docs.map((doc) => doc.data() as Pack);
      setPacks(packs);
    });
    return unsubscribe;
  }, [lobbyId, setPacks]);

  return packs;
}
