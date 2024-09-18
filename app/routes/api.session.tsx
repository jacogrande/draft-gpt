import { ActionFunction, json, Session } from "@remix-run/node";
import { adminAuth } from "~/.server/firebase-admin";
import { commitSession, destroySession, getSession } from "~/.server/session";

//========= MAIN =========//
export const action: ActionFunction = async ({ request }) => {
  try {
    const session = await getSession(request.headers.get("Cookie"));
    const method = request.method;
    if (method === "POST") return postHandler(request, session);
    if (method === "DELETE") return deleteHandler(session);
    return json({ error: "Invalid method" }, { status: 405 });
  } catch (error) {
    console.error("Error handling session:", error);
    return json({ error: "Internal server error" }, { status: 500 });
  }
};

//========= HANDLERS =========//
const postHandler = async (request: Request, session: Session) => {
  try {
    // Verify the requester's idToken
    const { idToken } = await request.json();
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const uid = decodedToken.uid;

    // attach the idToken to the session cookie
    session.set("idToken", idToken);
    session.set("uid", uid);
    return json(
      { success: true },
      {
        headers: {
          "Set-Cookie": await commitSession(session),
        },
      }
    );
  } catch (error) {
    console.error("Error verifying idToken:", error);
    return json({ error: "Invalid idToken" }, { status: 401 });
  }
};

const deleteHandler = async (session: Session) => {
  // Destroy the session cookie
  return json(
    { success: true },
    {
      headers: {
        "Set-Cookie": await destroySession(session),
      },
    }
  );
};
