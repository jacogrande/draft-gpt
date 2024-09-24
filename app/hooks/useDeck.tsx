import { doc, onSnapshot, QuerySnapshot } from "firebase/firestore";
import { useCallback, useEffect, useState } from "react";
import { useUser } from "~/hooks/useUser";
import { db } from "~/model/firebase";
import { Deck } from "~/util/types";

const useDeck = (deckId: string) => {
  const [deck, setDeck] = useState<Deck | null>(null);
  const { user } = useUser();

  const snapshotHandler = useCallback(async (snapshot: QuerySnapshot) => {
    const deckDoc = snapshot.docs[0];
    if (deckDoc.exists()) {
      const deckData = { ...(deckDoc.data() as Deck), id: deckDoc.id };
      setDeck(deckData);
    } else {
      setDeck(null);
    }
  }, []);

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
  }, [user, deckId, snapshotHandler]);

  return { deck, setDeck };
};

export default useDeck;
