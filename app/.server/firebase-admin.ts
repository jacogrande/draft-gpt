import admin from "firebase-admin";
import { getAuth } from "firebase-admin/auth";
import serviceAccount from "~/service-account.json";
import { User } from "~/util/types";

if (admin.apps.length === 0) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    storageBucket: "draft-gpt-81aaa.appspot.com",
  });
}

export const adminAuth = getAuth();
export const adminDb = admin.firestore();
export const storage = admin.storage();
export default admin;

export const getUserWithAdminDb = async (uid: string): Promise<User | null> => {
  const userDoc = await adminDb.collection("users").doc(uid).get();
  if (!userDoc.exists) return null;
  return { ...(userDoc.data() as User), uid: userDoc.id };
};
