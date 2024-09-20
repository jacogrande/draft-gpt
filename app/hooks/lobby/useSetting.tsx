import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useEffect } from "react";
import { create } from "zustand";
import { db } from "~/model/firebase";
import { SettingWithMetadata } from "~/util/types";

type SettingStore = {
  setting: SettingWithMetadata | null;
  setSetting: (setting: SettingWithMetadata | null) => void;
};

export const useSettingStore = create<SettingStore>((set) => ({
  setting: null,
  setSetting: (setting) => set({ setting }),
}));

const useSetting = (lobbyId: string) => {
  const { setting, setSetting } = useSettingStore();

  useEffect(() => {
    // create a snapshot of a query for a setting document in the `settings` top level collection that matches the lobbyId
    const querySnapshot = query(collection(db, "settings"), where("lobbyId", "==", lobbyId));
    const unsubscribe = onSnapshot(querySnapshot, (snapshot) => {
      const settingDoc = snapshot.docs[0];
      if (settingDoc.exists()) {
        const setting = settingDoc.data() as SettingWithMetadata;
        setSetting(setting);
      } else {
        setSetting(null);
      }
    });
    return unsubscribe;
  },
  [lobbyId, setSetting]);

  return setting;
}

export default useSetting;
