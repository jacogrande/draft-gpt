import { Unsubscribe } from "firebase/auth";
import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  setDoc,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { MAX_IDLE_TIME } from "~/hooks/lobby/useHeartbeat";
import { db } from "~/model/firebase";
import { ADJECTIVES, NOUNS } from "~/util/constants";
import { Lobby, User } from "~/util/types";

const LOBBIES_COLLECTION = "lobbies";

/**
 * Create a new lobby in the database
 * @param user - the creator's user
 * @param lobbyName - the name of the lobby
 * @returns the id of the created lobby
 * @description this will create a new lobby document in firestore, adding the creating user to the `activeUsers` array
 */
export const createLobby = async (
  user: User,
  lobbyName: string
): Promise<string> => {
  const lobbyRef = doc(collection(db, LOBBIES_COLLECTION));
  const currentTimestamp = Timestamp.fromDate(new Date());
  const lobby: Lobby = {
    id: lobbyRef.id,
    name: lobbyName,
    createdBy: user.uid,
    createdAt: currentTimestamp,
    activeUsers: [
      {
        username: user.username,
        uid: user.uid,
      },
    ],
    activityMap: {},
    lastActive: currentTimestamp,
  };
  await setDoc(lobbyRef, lobby);
  return lobbyRef.id;
};

/**
 * Join a lobby with the provided id
 * @param user - the requesting user
 * @param lobbyId - the id of the lobby to join
 * @description this will add the user to the lobby document's `activeUsers` array
 */
export const joinLobby = async (user: User, lobbyId: string): Promise<void> => {
  const lobbyRef = doc(db, LOBBIES_COLLECTION, lobbyId);
  await updateDoc(lobbyRef, {
    activeUsers: arrayUnion({ username: user.username, uid: user.uid }),
  });
};

/**
 * Get a lobby by id
 * @param lobbyId - the id of the lobby to get
 * @returns the lobby or null if not found
 */
export const getLobby = async (lobbyId: string): Promise<Lobby | null> => {
  const lobbyDoc = await getDoc(doc(db, LOBBIES_COLLECTION, lobbyId));
  return lobbyDoc.exists() ? (lobbyDoc.data() as Lobby) : null;
};

/**
 * Get a snapshot of all lobbies
 * @param callback - the callback function to call each time a change to the lobbies collection is caught
 * @returns an unsubscribe function to stop listening for changes
 */
export const subscribeToLobbies = (
  callback: (lobbies: Lobby[]) => void
): Unsubscribe => {
  const lobbiesRef = collection(db, LOBBIES_COLLECTION);
  const MAX_IDLE_TIMESTAMP = Timestamp.fromDate(
    new Date(Date.now() - MAX_IDLE_TIME)
  );
  const activeLobbiesQuery = query(
    lobbiesRef,
    where("lastActive", ">=", MAX_IDLE_TIMESTAMP), // This ensure only lobbies with recently active users are returned (heartbeats)
    where("activeUsers", "!=", []) // This ensures the activeUsers array is not empty
  );

  return onSnapshot(activeLobbiesQuery, (snapshot) => {
    const lobbies = snapshot.docs.map((doc) => doc.data() as Lobby);
    callback(lobbies);
  });
};

/**
 * @returns a random two word lobby name (e.g. "glorious-hamster")
 */
export const createRandomLobbyName = (): string => {
  const randomAdjective =
    ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const randomNoun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  return `${randomAdjective}-${randomNoun}`.toLowerCase();
};

/**
 * Triggers a heartbeats for the current user
 * @param user - the user to pulse
 * @param lobbyId - the id of the lobby to pulse
 * @description this will update the lobby's `lastActive` timestamp and the user's `lastSeen` timestamp to now
 */
export const sendPulse = async (user: User, lobbyId: string): Promise<void> => {
  const lobbyRef = doc(db, LOBBIES_COLLECTION, lobbyId);
  const currentTimestamp = Timestamp.fromDate(new Date());
  console.log("pulsing user with uid", user.uid, "and lobbyId", lobbyId);
  await setDoc(
    lobbyRef,
    {
      activityMap: {
        [user.uid]: currentTimestamp,
      },
      lastActive: currentTimestamp,
    },
    { merge: true }
  );
};

/**
 * Removes any inactive users from the lobby
 * @param lobbyId - the id of the lobby to clean up
 * @description this will remove any users who haven't been active within the last MAX_IDLE_TIME
 */
export const cleanupLobbyUsers = async (lobbyId: string): Promise<void> => {
  const lobbyRef = doc(db, LOBBIES_COLLECTION, lobbyId);
  const currentSeconds = Math.floor(new Date().getTime() / 1000);
  const lobbyDoc = await getDoc(lobbyRef);
  const lobby = lobbyDoc.data() as Lobby;
  const activeUserIds = Object.keys(lobby.activityMap).filter(
    (userId) =>
      lobby.activityMap[userId].seconds + MAX_IDLE_TIME / 1000 > currentSeconds
  );
  const activeUsers = lobby.activeUsers.filter((user) =>
    activeUserIds.includes(user.uid)
  );
  if (activeUsers.length === lobby.activeUsers.length) return;
  await updateDoc(lobbyRef, {
    activeUsers: activeUsers,
  });
};

/**
 * Marks a user as ready in the lobby
 * @param lobbyId - the id of the lobby to mark as ready
 * @param userId - the id of the user to mark as ready
 * @description this will add a new record to the lobby's `readyMap` with the user's id and the current timestamp
 */
export const readyUp = async (
  lobbyId: string,
  userId: string
): Promise<void> => {
  const lobbyRef = doc(db, LOBBIES_COLLECTION, lobbyId);
  await setDoc(
    lobbyRef,
    {
      readyMap: {
        [userId]: new Timestamp(Math.floor(new Date().getTime() / 1000), 0),
      },
    },
    { merge: true }
  );
};

export const postWorldbuildingMessage = async (message: string, userId: string, lobbyId: string): Promise<void> => {
  const lobbyRef = doc(db, LOBBIES_COLLECTION, lobbyId);
  const currentTimestamp = Timestamp.fromDate(new Date());
  await setDoc(
    lobbyRef,
    {
      worldbuildingMessages: arrayUnion({message, posterId: userId, timestamp: currentTimestamp}),
    },
    { merge: true }
  );
};
