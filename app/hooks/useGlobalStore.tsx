import { create } from "zustand";
import { Card } from "~/util/types";

interface GlobalStore {
  peekedCard: Card | null;
  setPeekedCard: (card: Card | null) => void;
}

export const useGlobalStore = create<GlobalStore>((set) => ({
  peekedCard: null,
  setPeekedCard: (card) => set({ peekedCard: card }),
}));
