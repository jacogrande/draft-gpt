import { doc, onSnapshot } from "firebase/firestore";
import { useState, useEffect } from "react";
import { create } from "zustand";
import { db } from "~/model/firebase";
import { Lobby } from "~/util/types";

type LobbyStore = {
  lobby: Lobby | null;
  setLobby: (lobby: Lobby | null) => void;
};

export const useLobbyStore = create<LobbyStore>((set) => ({
  lobby: null,
  setLobby: (lobby) => set({ lobby }),
}));

export function useLobby(lobbyId: string): { lobby: Lobby | null; loading: boolean; error: Error | null } {
  const { lobby, setLobby } = useLobbyStore();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  /**
    * Fetches a snapshot of the lobby document from the database
    * and sets the lobby state to the data of the document
    */
  useEffect(() => {
    setLoading(true);
    setError(null);

    const lobbyRef = doc(db, 'lobbies', lobbyId);
    const unsubscribe = onSnapshot(
      lobbyRef,
      (doc) => {
        if (doc.exists()) {
          setLobby({ id: doc.id, ...doc.data() } as Lobby);
        } else {
          setLobby(null);
          setError(new Error('Lobby not found'));
        }
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching lobby:', err);
        setError(err);
        setLoading(false);
      }
    );

    // Cleanup function to unsubscribe from the snapshot listener
    return () => unsubscribe();
  }, [lobbyId, setLobby]);

  return { lobby, loading, error };
}
