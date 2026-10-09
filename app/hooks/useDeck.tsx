import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { useEffect } from "react";
import { create } from "zustand";
import { Deck } from "~/util/types";

type DeckStore = {
  deck: Deck | null;
  setDeck: (deck: Deck | null) => void;
};

export const useDeckStore = create<DeckStore>((set) => ({
  deck: null,
  setDeck: (deck) => set({ deck }),
}));

export const deckIdOf = (deck: Deck) => deck.id as Id<"decks">;

const useDeck = (deckId: string) => {
  const deck = useQuery(api.deck.decks.get, { deckId: deckId as Id<"decks"> });
  const setDeck = useDeckStore((state) => state.setDeck);

  useEffect(() => {
    setDeck(deck ?? null);
    return () => setDeck(null);
  }, [deck, setDeck]);

  return { deck };
};

export default useDeck;
