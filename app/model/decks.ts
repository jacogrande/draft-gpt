import { collection, getDocs } from "firebase/firestore";
import { db } from "~/model/firebase";
import { Deck } from "~/util/types";

export const getAllDecks = async (userId: string) => {
  const decksRef = collection(db, "users", userId, "decks");
  const querySnapshot = await getDocs(decksRef);
  const decks = querySnapshot.docs.map((doc) => doc.data() as Deck);
  return decks;
};
