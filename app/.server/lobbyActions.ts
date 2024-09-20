import admin, { adminDb } from "~/.server/firebase-admin";
import { isSetting, Setting } from "~/.server/prompts/responseTypes";
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
  // TODO: Remove user from readyMap
  await lobbyRef.update({
    activeUsers: admin.firestore.FieldValue.arrayRemove({
      username: user.username,
      uid: user.uid,
    }),
  });
};

export const attachSettingToLobby = async (
  lobbyId: string,
  settingId: string
): Promise<void> => {
  const lobbyRef = adminDb.collection("lobbies").doc(lobbyId);
  await lobbyRef.update({
    setting: settingId,
  });
};

export const getLobbySetting = async (
  lobbyId: string
): Promise<Setting & { id: string }> => {
  const lobbyRef = adminDb.collection("lobbies").doc(lobbyId);
  const lobbyDoc = await lobbyRef.get();
  const lobbyData = lobbyDoc.data();
  if (!lobbyData) throw new Error("Lobby not found");
  const settingId = lobbyData.setting;
  if (!settingId) throw new Error("Lobby has no setting");

  // get setting doc
  const settingDocRef = adminDb.collection("settings").doc(settingId);
  const settingDoc = await settingDocRef.get();
  const settingData = settingDoc.data();
  if (!settingData) throw new Error("Setting not found");
  if (!isSetting(settingData))
    throw new Error("Setting is not formatted correctly");
  return { ...settingData, id: settingDocRef.id };
};
