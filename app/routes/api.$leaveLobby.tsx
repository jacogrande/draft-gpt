import { ActionFunctionArgs } from "@remix-run/node";
import { adminAuth, getUserWithAdminDb } from "~/.server/firebase-admin";
import { leaveLobby } from "~/.server/lobbyActions";
import { User } from "~/util/types";

//========= TYPES =========//
type Body = {
  token: string;
  lobbyId: string;
};

//========= HANDLER =========//
export async function action({ request }: ActionFunctionArgs) {
  try {
    const body = await request.json();
    if (!isValidBody(body)) return { status: 422 };
    const { token, lobbyId } = body;
    const user = await getUserFromToken(token);
    if (!user) return { status: 401 };
    await leaveLobby(user, lobbyId);
    return { status: 200 };
  } catch (error) {
    console.error(error);
    return { status: 500 };
  }
}

//========= UTILS =========//

/**
 * Verifies the body of the request contains the required fields
 * @param body - the body of the request
 * @returns true if the body contains the required fields, false otherwise
 */
const isValidBody = (body: unknown): body is Body => {
  return (
    typeof body === "object" &&
    body !== null &&
    "token" in body &&
    "lobbyId" in body
  );
};

const getUserFromToken = async (token: string): Promise<User | null> => {
  const decodedToken = await adminAuth.verifyIdToken(token);
  const uid = decodedToken.uid;
  const user = await getUserWithAdminDb(uid);
  return user;
};
