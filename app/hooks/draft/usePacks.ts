import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { create } from "zustand";
import { Card } from "~/util/types";

type PacksStore = {
  selectedCard: Card | null;
  setSelectedCard: (card: Card | null) => void;
};

export const usePacksStore = create<PacksStore>((set) => ({
  selectedCard: null,
  setSelectedCard: (card) => set({ selectedCard: card }),
}));

export const useCurrentPack = (lobbyId: Id<"lobbies">) =>
  useQuery(api.draft.picks.current, { lobbyId });

export const usePacksHeld = (lobbyId: Id<"lobbies">) =>
  useQuery(api.draft.picks.held, { lobbyId }) ?? {};

export const useSetting = (lobbyId: Id<"lobbies">) =>
  useQuery(api.draft.settings.forLobby, { lobbyId });
