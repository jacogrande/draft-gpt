import { collection, doc, Timestamp, setDoc, arrayUnion, getDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "~/model/firebase";
import { STARTING_LIFE, REQUIRED_PLAYERS_FOR_GAME } from "~/util/constants";
import { Game, User } from "~/util/types";

/**
 * Creates a new game lobby
 * @param name - the name of the game (4 characters)
 * @param user - the user creating the game
 * @returns the id of the created game
 * @description this will create a new game document in firestore, adding the creating user to the `activeUsers` array
 */
export const createGame = async (name: string, user: User): Promise<string> => {
  const gamesRef = collection(db, "games");
  const gameDoc = doc(gamesRef);
  const newGame: Game = {
    id: gameDoc.id,
    name,
    createdAt: Timestamp.now(),
    activeUsers: [{ username: user.username, uid: user.uid }],
    createdBy: user.uid,
    readyMap: {},
    decks: {},
    lifeTotals: {},
  };
  await setDoc(gameDoc, newGame);
  return gameDoc.id;
};

/**
 * Joins a game lobby
 * @param user - the user joining the game
 * @param gameId - the id of the game to join
 * @returns true if the user successfully joins the game, false otherwise
 * @description this will add the user to the game document's `activeUsers` array
 */
export const joinGame = async (
  user: User,
  gameId: string
): Promise<boolean> => {
  const gameRef = doc(db, "games", gameId);
  const gameData = await getDoc(gameRef);
  if (!gameData.exists()) throw new Error("Game not found");

  const game = gameData.data() as Game;
  const userCount = game.activeUsers.filter(
    (user) => user.uid !== user.uid
  ).length; // filter out the current user
  const newLifeTotal = game.lifeTotals[user.uid] || STARTING_LIFE;
  if (userCount >= REQUIRED_PLAYERS_FOR_GAME) return false;

  await setDoc(
    gameRef,
    {
      activeUsers: arrayUnion({ username: user.username, uid: user.uid }),
      lifeTotals: { [user.uid]: newLifeTotal },
    },
    { merge: true }
  );
  return true;
};

/**
 * Fetches a game by name
 * @param name - the name of the game (4 characters)
 * @returns the game document or null if not found
 */
export const getGameByName = async (name: string) => {
  const gamesRef = collection(db, "games");
  const querySnapshot = query(gamesRef, where("name", "==", name));
  const docs = await getDocs(querySnapshot);
  const game = docs.docs[0];
  if (!game) return null;

  return game.data() as Game;
};
