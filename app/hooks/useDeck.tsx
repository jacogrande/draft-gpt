import { doc, onSnapshot, QuerySnapshot } from "firebase/firestore";
import { useCallback, useEffect } from "react";
import { create } from "zustand";
import { useUser } from "~/hooks/useUser";
import { db } from "~/model/firebase";
import { Deck } from "~/util/types";

type DeckStore = {
  deck: Deck | null;
  setDeck: (deck: Deck | null) => void;
};

export const useDeckStore = create<DeckStore>((set) => ({
  deck: null,
  setDeck: (deck) => set({ deck }),
}));

const useDeck = (deckId: string) => {
  const { deck, setDeck } = useDeckStore();
  const { user } = useUser();

  const snapshotHandler = useCallback(async (snapshot: QuerySnapshot) => {
    const deckDoc = snapshot.docs[0];
    if (deckDoc.exists()) {
      const deckData = { ...(deckDoc.data() as Deck), id: deckDoc.id };
      setDeck(deckData);
    } else {
      setDeck(null);
    }
  }, [setDeck]);

  useEffect(() => {
    if (!user) return;
    // create a snapshot of the deck doc
    const deckRef = doc(db, 'users', user.uid, 'decks', deckId);
    const unsubscribe = onSnapshot(
      deckRef,
      (doc) => {
        if (doc.exists()) {
          setDeck({ ...doc.data() as Deck, id: doc.id });
        } else {
          setDeck(null);
        }
      },
      (err) => {
        console.error('Error fetching deck:', err);
      }
    );
    return unsubscribe;
  }, [user, deckId, snapshotHandler, setDeck]);

  return { deck, setDeck };
};

export default useDeck;
