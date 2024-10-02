import { create } from "zustand";

type ZoneRefs = {
  handRef: React.RefObject<HTMLDivElement> | null;
  setHandRef: (ref: React.RefObject<HTMLDivElement> | null) => void;
  battlefieldRef: React.RefObject<HTMLDivElement> | null;
  setBattlefieldRef: (ref: React.RefObject<HTMLDivElement> | null) => void;
  deckRef: React.RefObject<HTMLDivElement> | null;
  setDeckRef: (ref: React.RefObject<HTMLDivElement> | null) => void;
  graveyardRef: React.RefObject<HTMLDivElement> | null;
  setGraveyardRef: (ref: React.RefObject<HTMLDivElement> | null) => void;
};

export const useZoneRefs = create<ZoneRefs>((set) => ({
  handRef: null,
  setHandRef: (ref) => set({ handRef: ref }),
  battlefieldRef: null,
  setBattlefieldRef: (ref) => set({ battlefieldRef: ref }),
  deckRef: null,
  setDeckRef: (ref) => set({ deckRef: ref }),
  graveyardRef: null,
  setGraveyardRef: (ref) => set({ graveyardRef: ref }),
}));
