import { useEffect, useState } from "react";
import { subscribeToLobbies } from "~/model/lobby";
import { Lobby } from "~/util/types";

const useLobbyList = () => {
  const [lobbies, setLobbies] = useState<Lobby[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToLobbies((lobbies) => {
      setLobbies(lobbies.sort((a, b) => a.name.localeCompare(b.name)));
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return { lobbies, loading };
};

export default useLobbyList;
