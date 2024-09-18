import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { create } from "zustand";
import { auth, db } from "~/model/firebase";
import { User } from "~/util/types";

/******** TYPES AND CONSTANTS ********/
interface UserStore {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
}

/******** IMPLEMENTATION ********/
const useUserStore = create<UserStore>((set) => ({
  user: null,
  loading: true,
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
}));

/**
 * Hook to get the current user
 * @returns the current user doc or null if not logged in
 */
export const useUser = (): { user: User | null; loading: boolean } => {
  const { user, loading } = useUserStore();
  return { user, loading };
};

/**
 * Hook to subscribe to user changes
 * @returns a function to unsubscribe from user changes
 */
export const useUserProvider = () => {
  const setUser = useUserStore((state) => state.setUser);
  const setLoading = useUserStore((state) => state.setLoading);

  const subscribeToUserChanges = () => {
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        const userDocRef = doc(db, "users", firebaseUser.uid);
        const unsubscribeSnapshot = onSnapshot(userDocRef, (docSnapshot) => {
          if (docSnapshot.exists()) {
            const userData = {...docSnapshot.data() as User, uid: firebaseUser.uid};
            setUser(userData);
          } else {
            console.error("User document does not exist");
            setUser(null);
          }
          setLoading(false);
        });

        return () => {
          unsubscribeSnapshot();
        };
      } else {
        setUser(null);
        setLoading(false);
      }
    });
    return unsubscribeAuth;
  };

  return subscribeToUserChanges;
};
