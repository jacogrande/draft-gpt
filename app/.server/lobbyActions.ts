import admin, { adminDb } from "~/.server/firebase-admin";
import { User } from "~/util/types";

/**
 * Leave a lobby with the provided id
 * @param user - the requesting user
 * @param lobbyId - the id of the lobby to leave
 * @description this will remove the user from the lobby document's `activeUsers` array
 */
export const leaveLobby = async (
  user: User,
  lobbyId: string
): Promise<void> => {
  const lobbyRef = adminDb.collection("lobbies").doc(lobbyId);
  await lobbyRef.update({
    activeUsers: admin.firestore.FieldValue.arrayRemove({
      username: user.username,
      uid: user.uid,
    }),
  });
};
