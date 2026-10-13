import { api } from "@convex/_generated/api";
import { useMutation } from "convex/react";
import { deckIdOf, useDeckStore } from "~/hooks/useDeck";
import { useToast } from "~/hooks/useToast";

export const useDeckEdits = () => {
  const deck = useDeckStore((state) => state.deck);
  const toSideboard = useMutation(api.deck.decks.moveToSideboard);
  const toMainboard = useMutation(api.deck.decks.moveToMainboard);
  const toast = useToast((state) => state.toast);
  const move = async (cardId: string, sideboard: boolean) => {
    if (!deck) return;
    try {
      await (sideboard ? toSideboard : toMainboard)({
        deckId: deckIdOf(deck),
        cardId,
      });
    } catch {
      toast("Could not move card. Please try again.", "error");
    }
  };
  return {
    toSideboard: (id: string) => move(id, true),
    toMainboard: (id: string) => move(id, false),
  };
};
