import { create } from "zustand";
import { Card } from "~/util/types";

interface GlobalStore {
  peekedCard: Card | null;
  setPeekedCard: (card: Card | null) => void;
  shiftKeyPressed: boolean;
  setShiftKeyPressed: (shiftKeyPressed: boolean) => void;
  selectedCards: Card[];
  setSelectedCards: (selectedCards: Card[]) => void;
  pauseCommands: boolean;
  setPauseCommands: (pauseCommands: boolean) => void;
}

export const useGlobalStore = create<GlobalStore>((set) => ({
  peekedCard: null,
  setPeekedCard: (card) => set({ peekedCard: card }),
  shiftKeyPressed: false,
  setShiftKeyPressed: (shiftKeyPressed) => set({ shiftKeyPressed }),
  selectedCards: [],
  setSelectedCards: (selectedCards) => set({ selectedCards }),
  pauseCommands: false,
  setPauseCommands: (pauseCommands) => set({ pauseCommands }),
}));
