import {
  isSignInWithEmailLink,
  sendSignInLinkToEmail,
  signInWithEmailLink,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "~/model/firebase";
import { BASE_URL } from "~/util/constants";

/**
 * Send a sign in link to the email address
 * @param email - email address to send the link to
 * @param username - additional state to send with the link
 */
export const sendJoinLink = async (
  email: string,
  username: string
): Promise<void> => {
  if (!window) throw new Error("window is undefined");
  const ACTION_CODE_SETTINGS = {
    url: `${BASE_URL}/finish-join?username=${username}`,
    handleCodeInApp: true,
  };
  await sendSignInLinkToEmail(auth, email, ACTION_CODE_SETTINGS);
  // save the email locally
  // NOTE: If the user follows the link through another device,
  //       they'll need to enter their email again to verify their account
  window.localStorage.setItem("emailForSignIn", email);
};

/**
 * Check if the current page is a sign in with email link
 * @returns true if the current page is a sign in with email link
 *          false if the current page is not a sign in with email link
 */
export const validateJoinLink = (): boolean => {
  if (!window) throw new Error("window is undefined");
  if (!isSignInWithEmailLink(auth, window.location.href)) {
    return false;
  }
  return true;
};

/**
 * Get the email address stored in local storage (from when they requested to join)
 * @returns email address or null if not found
 */
export const getStoredEmail = (): string | null => {
  if (!window) throw new Error("window is undefined");
  return window.localStorage.getItem("emailForSignIn");
};

/**
 * Sign in from the linked page
 * @param email - email to sign in with
 */
export const signInWithJoinLink = async (email: string) => {
  if (!window) throw new Error("window is undefined");
  await signInWithEmailLink(auth, email, window.location.href);
  window.localStorage.removeItem("emailForSignIn");
};

/**
 * Create a new user document in the database
 * @param username - username to create the document with
*/
export const createUserDoc = async (username: string) => {
  if (!auth.currentUser) throw new Error("User is not signed in");
  const userRef = doc(db, "users", auth.currentUser.uid);
  const userDoc = await getDoc(userRef);
  if (userDoc.exists()) throw new Error("User already exists");
  await setDoc(userRef, {
    username: username,
    email: auth.currentUser.email,
  });
};
