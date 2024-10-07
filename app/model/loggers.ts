import { arrayUnion, doc, getDoc, setDoc, Timestamp } from "firebase/firestore";
import { db } from "~/model/firebase";

export const logInteraction = (message: string) => async (gameId: string, uid: string, targetCardId?: string) => {
  const gameRef = doc(db, "games", gameId);
  const gameDoc = await getDoc(gameRef);
  if (!gameDoc.exists()) throw new Error("Game not found");
  await setDoc(gameRef, {
    log: arrayUnion(
      {
        uid,
        message,
        timestamp: Timestamp.now(),
        targetCard: targetCardId || null,
      },
    ),
  }, { merge: true });
};

export const logShuffle = logInteraction("shuffled");
export const logTap = logInteraction("tapped");
export const logUntap = logInteraction("untapped");
