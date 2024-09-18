import { createCookieSessionStorage, redirect } from "@remix-run/node";
import { adminAuth } from "~/.server/firebase-admin";

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__session",
    secrets: [process.env.SESSION_SECRET || ""], // Replace with your secret
    sameSite: "lax",
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  },
});

export const { getSession, commitSession, destroySession } = sessionStorage;

export const verifySession = async ({ request }: { request: Request }) => {
  const session = await getSession(request.headers.get("Cookie"));
  const idToken = session.get("idToken");
  if (!idToken) return redirect("/join");

  // verify the idToken
  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    return { user: decodedToken.uid };
  } catch (error) {
    return redirect("/join");
  }
};
