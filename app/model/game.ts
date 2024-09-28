import { collection, doc, getDocs, query, setDoc, Timestamp, where } from "firebase/firestore";
import { db } from "~/model/firebase";
import { Game, User } from "~/util/types";

export const createGame = async (name: string, user: User) => {
  const gamesRef = collection(db, "games");
  const gameDoc = doc(gamesRef);
  const newGame: Game = {
    id: gameDoc.id,
    name,
    createdAt: Timestamp.now(),
    activeUsers: [{ username: user.username, uid: user.uid }],
    createdBy: user.uid,
    decks: {},
  };
  await setDoc(gameDoc, newGame);
  return gameDoc.id;
};

export const getGameByName = async (name: string) => {
  const gamesRef = collection(db, "games");
  const querySnapshot = query(gamesRef, where("name", "==", name));
  const docs = await getDocs(querySnapshot);
  const game = docs.docs[0];
  if (!game) return null;
  return game.data() as Game;
};
