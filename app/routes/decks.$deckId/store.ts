import { create } from "zustand";

interface DeckEditorStore {
  sideboardRect: DOMRect | null;
  setSideboardRect: (rect: DOMRect | null) => void;
  sideboardRef: HTMLDivElement | null;
  setSideboardRef: (ref: HTMLDivElement | null) => void;
}

export const useDeckEditorStore = create<DeckEditorStore>((set) => ({
  sideboardRect: null,
  setSideboardRect: (rect) => set({ sideboardRect: rect }),
  sideboardRef: null,
  setSideboardRef: (ref) => set({ sideboardRef: ref }),
}));
