import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { useEffect } from "react";
import { create } from "zustand";
import { auth, db } from "~/services/firebase";

/******** TYPES AND CONSTANTS ********/
interface User {
  uid: string;
  email: string;
  username: string;
}

interface UserStore {
  user: User | null;
  setUser: (user: User | null) => void;
}

/******** IMPLEMENTATION ********/
const useUserStore = create<UserStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));

/**
 * Hook to get the current user
 * @returns the current user doc or null if not logged in
 */
export const useUser = () => {
  return useUserStore((state) => state.user);
};

/**
 * Hook to subscribe to user changes
 * @returns a function to unsubscribe from user changes
 */
export const useUserProvider = () => {
  const setUser = useUserStore((state) => state.setUser);

  const subscribeToUserChanges = () => {
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const userDocRef = doc(db, "users", firebaseUser.uid);
        const unsubscribeSnapshot = onSnapshot(userDocRef, (docSnapshot) => {
          if (docSnapshot.exists()) {
            const userData = docSnapshot.data() as User;
            setUser(userData);
          } else {
            console.error("User document does not exist");
            setUser(null);
          }
        });

        return () => {
          unsubscribeSnapshot();
        };
      } else {
        setUser(null);
      }
    });
    return unsubscribeAuth;
  };

  return subscribeToUserChanges;
};
