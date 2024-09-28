import { doc, onSnapshot } from "firebase/firestore";
import { useState, useEffect } from "react";
import { create } from "zustand";
import { db } from "~/model/firebase";
import { Game } from "~/util/types"; // Make sure to define the Game type

type GameStore = {
  game: Game | null;
  setGame: (game: Game | null) => void;
};

export const useGameStore = create<GameStore>((set) => ({
  game: null,
  setGame: (game) => set({ game }),
}));

export function useGame(gameId: string): { game: Game | null; loading: boolean; error: Error | null } {
  const { game, setGame } = useGameStore();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Fetches a snapshot of the game document from the database
   * and sets the game state to the data of the document
   */
  useEffect(() => {
    setLoading(true);
    setError(null);

    const gameRef = doc(db, 'games', gameId);
    const unsubscribe = onSnapshot(
      gameRef,
      (doc) => {
        if (doc.exists()) {
          setGame({ id: doc.id, ...doc.data() } as Game);
        } else {
          setGame(null);
          setError(new Error('Game not found'));
        }
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching game:', err);
        setError(err);
        setLoading(false);
      }
    );

    // Cleanup function to unsubscribe from the snapshot listener
    return () => unsubscribe();
  }, [gameId, setGame]);

  return { game, loading, error };
}

